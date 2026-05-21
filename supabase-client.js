// supabase-client.js - lectura publica del catalogo desde Supabase.
(function() {
  var cfg = window.CONFIG || {};
  var client = null;

  function isReady() {
    return Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_PUBLISHABLE_KEY && window.supabase);
  }

  function getClient() {
    if (!isReady()) return null;
    if (!client) {
      client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_PUBLISHABLE_KEY);
    }
    return client;
  }

  function formatCurrency(currency) {
    return currency || cfg.CURRENCY || 'ARS';
  }

  function normalizeDni(dni) {
    return String(dni || '').replace(/\D/g, '');
  }

  function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
  }

  function authEmailForDni(dni) {
    return 'dni-' + normalizeDni(dni) + '@dimension3.local';
  }

  function authEmailForCustomer(customer) {
    return normalizeEmail(customer && customer.email) || authEmailForDni(customer && customer.dni);
  }

  var PROFILE_COLUMNS = 'user_id,cliente_id,dni,nombre,apellido,email,telefono,direccion,provider';

  function mapCustomer(row) {
    if (!row) return null;
    return {
      id: row.id,
      accessId: row.id_access || null,
      dni: normalizeDni(row.dni),
      name: [row.nombre, row.apellido].filter(Boolean).join(' ').trim() || 'Cliente',
      firstName: row.nombre || '',
      lastName: row.apellido || '',
      email: row.email || '',
      phone: row.telefono || '',
      address: row.direccion || '',
      raw: row
    };
  }

  function mapProfile(row) {
    if (!row) return null;
    var firstName = row.nombre || '';
    var lastName = row.apellido || '';
    return {
      userId: row.user_id,
      clienteId: row.cliente_id || null,
      dni: normalizeDni(row.dni),
      name: [firstName, lastName].filter(Boolean).join(' ').trim() || row.email || 'Cliente',
      firstName: firstName,
      lastName: lastName,
      email: row.email || '',
      phone: row.telefono || '',
      address: row.direccion || '',
      provider: row.provider || '',
      raw: row
    };
  }

  function mergeProfileUser(user, profile) {
    if (!profile) return user;
    var firstName = profile.firstName || user.firstName || '';
    var lastName = profile.lastName || user.lastName || '';
    var name = [firstName, lastName].filter(Boolean).join(' ').trim() || user.name || profile.name || 'Cliente';

    return Object.assign({}, user, {
      dni: profile.dni || user.dni || '',
      clienteId: profile.clienteId || user.clienteId || null,
      name: name,
      firstName: firstName,
      lastName: lastName,
      email: profile.email || user.email || '',
      phone: profile.phone || user.phone || '',
      address: profile.address || user.address || '',
      provider: profile.provider || user.provider || 'email',
      profile: profile.raw || null
    });
  }

  async function fetchCustomerByDni(dni) {
    var sb = getClient();
    var cleanDni = normalizeDni(dni);
    if (!sb || !cleanDni) return { customer: null, error: null };

    var result = await sb
      .from('clientes')
      .select('id,id_access,dni,nombre,apellido,email,telefono,direccion')
      .eq('dni', cleanDni)
      .maybeSingle();

    if (result.error) {
      console.warn('Supabase cliente error:', result.error.message);
      return { customer: null, error: result.error };
    }

    return { customer: mapCustomer(result.data), error: null };
  }

  async function fetchProfileByUserId(userId) {
    var sb = getClient();
    if (!sb || !userId) return { profile: null, error: null };

    var result = await sb
      .from('perfiles')
      .select(PROFILE_COLUMNS)
      .eq('user_id', userId)
      .maybeSingle();

    if (result.error) {
      console.warn('Supabase perfil error:', result.error.message);
      return { profile: null, error: result.error };
    }

    return { profile: mapProfile(result.data), error: null };
  }

  async function upsertProfileFromCustomer(authUser, customer) {
    var sb = getClient();
    if (!sb || !authUser || !customer) return { profile: null, error: null };

    var result = await sb
      .from('perfiles')
      .upsert({
        user_id: authUser.id,
        cliente_id: customer.id,
        dni: customer.dni || null,
        nombre: customer.firstName || '',
        apellido: customer.lastName || '',
        email: customer.email || authUser.email || '',
        telefono: customer.phone || '',
        direccion: customer.address || '',
        provider: 'dni'
      }, { onConflict: 'user_id' })
      .select(PROFILE_COLUMNS)
      .maybeSingle();

    if (result.error) {
      console.warn('Supabase crear perfil DNI error:', result.error.message);
      return { profile: null, error: result.error };
    }

    return { profile: mapProfile(result.data), error: null };
  }

  function buildAccountUser(customer, authUser) {
    var meta = authUser && authUser.user_metadata ? authUser.user_metadata : {};
    var firstName = customer.firstName || meta.first_name || meta.nombre || '';
    var lastName = customer.lastName || meta.last_name || meta.apellido || '';
    var name = [firstName, lastName].filter(Boolean).join(' ').trim() || customer.name || meta.name || 'Cliente';

    return {
      id: authUser && authUser.id ? authUser.id : 'dni-' + customer.dni,
      dni: customer.dni,
      clienteId: customer.id,
      name: name,
      firstName: firstName,
      lastName: lastName,
      email: customer.email || meta.profile_email || '',
      phone: customer.phone || meta.phone || meta.telefono || '',
      address: customer.address || meta.address || meta.direccion || '',
      avatar: '',
      provider: 'dni',
      loginTime: new Date().toISOString()
    };
  }

  function splitFullName(name) {
    var parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ')
    };
  }

  function buildEmailAccountUser(authUser, fallback) {
    var meta = authUser && authUser.user_metadata ? authUser.user_metadata : {};
    var name = fallback.name || meta.name || (authUser && authUser.email) || 'Cliente';
    var parts = splitFullName(name);
    var firstName = meta.first_name || meta.nombre || parts.firstName;
    var lastName = meta.last_name || meta.apellido || parts.lastName;

    return {
      id: authUser && authUser.id ? authUser.id : 'email-' + (fallback.email || ''),
      dni: normalizeDni(meta.dni || fallback.dni || ''),
      name: [firstName, lastName].filter(Boolean).join(' ').trim() || name,
      firstName: firstName,
      lastName: lastName,
      email: meta.profile_email || fallback.email || (authUser && authUser.email) || '',
      phone: meta.phone || meta.telefono || '',
      address: meta.address || meta.direccion || '',
      avatar: meta.avatar_url || meta.picture || '',
      provider: fallback.provider || (authUser && authUser.app_metadata && authUser.app_metadata.provider) || 'email',
      loginTime: new Date().toISOString()
    };
  }

  async function registerEmailAccount(data) {
    var sb = getClient();
    var name = String(data.name || '').trim();
    var email = normalizeEmail(data.email);
    var password = data.password || '';
    var cleanDni = normalizeDni(data.dni);
    if (!sb) return { user: null, error: { message: 'Supabase no esta disponible.' } };
    if (!name || !email || !password) return { user: null, error: { message: 'Completá todos los campos.' } };

    if (cleanDni && cleanDni.length < 7) return { user: null, error: { message: 'DNI invalido.' } };

    if (cleanDni) {
      var lookup = await fetchCustomerByDni(cleanDni);
      if (lookup.error) {
        return { user: null, error: { message: 'No pudimos validar ese DNI. Proba de nuevo.' } };
      }
      if (lookup.customer) {
        return {
          user: null,
          activateDni: true,
          error: {
            message: 'Tu DNI ya esta cargado en el sistema. Anda a Activar DNI para crear tu contrasena y usar tus datos del local.'
          }
        };
      }
    }

    var result = await sb.auth.signUp({
      email: email,
      password: password,
      options: {
        data: { name: name, dni: cleanDni || '' }
      }
    });

    if (result.error) return { user: null, error: result.error };
    if (!result.data || !result.data.user) {
      return { user: null, error: { message: 'No se pudo crear la cuenta.' } };
    }

    return {
      user: buildEmailAccountUser(result.data.user, { name: name, email: email, dni: cleanDni }),
      needsVerification: !(result.data && result.data.session),
      error: null
    };
  }

  async function loginEmailAccount(email, password) {
    var sb = getClient();
    var cleanEmail = normalizeEmail(email);
    if (!sb) return { user: null, error: { message: 'Supabase no esta disponible.' } };
    if (!cleanEmail || !password) return { user: null, error: { message: 'Completá todos los campos.' } };

    var result = await sb.auth.signInWithPassword({
      email: cleanEmail,
      password: password
    });

    if (result.error) return { user: null, error: result.error };
    return { user: buildEmailAccountUser(result.data.user, { email: cleanEmail }), error: null };
  }

  async function signInWithGoogle(redirectTo) {
    var sb = getClient();
    if (!sb) return { error: { message: 'Supabase no esta disponible.' } };

    var result = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo || window.location.href
      }
    });

    return { error: result.error || null };
  }

  async function getCurrentAccount() {
    var sb = getClient();
    if (!sb) return { user: null, error: null };

    var sessionResult = await sb.auth.getSession();
    if (sessionResult.error) return { user: null, error: sessionResult.error };

    var authUser = sessionResult.data && sessionResult.data.session
      ? sessionResult.data.session.user
      : null;
    if (!authUser) return { user: null, error: null };

    var meta = authUser.user_metadata || {};
    var dniMatch = String(authUser.email || '').match(/^dni-(\d+)@dimension3\.local$/);
    var dniFromAuth = normalizeDni(meta.dni || (dniMatch && dniMatch[1]));
    var user = null;

    var customerForProfile = null;
    if (dniFromAuth) {
      var lookup = await fetchCustomerByDni(dniFromAuth);
      if (lookup.customer) {
        customerForProfile = lookup.customer;
        user = buildAccountUser(lookup.customer, authUser);
      }
    }

    if (!user) {
      user = buildEmailAccountUser(authUser, {
        email: authUser.email || '',
        provider: authUser.app_metadata && authUser.app_metadata.provider
      });
    }

    var profileResult = await fetchProfileByUserId(authUser.id);
    if (!profileResult.profile && customerForProfile) {
      profileResult = await upsertProfileFromCustomer(authUser, customerForProfile);
    }
    if (profileResult.profile) user = mergeProfileUser(user, profileResult.profile);

    return { user: user, error: null };
  }

  async function registerCustomerByDni(dni, password) {
    var sb = getClient();
    var cleanDni = normalizeDni(dni);
    if (!sb) return { user: null, error: { message: 'Supabase no esta disponible.' } };
    if (!cleanDni) return { user: null, error: { message: 'Ingresá un DNI válido.' } };

    var lookup = await fetchCustomerByDni(cleanDni);
    if (lookup.error) return { user: null, error: lookup.error };
    if (!lookup.customer) {
      return {
        user: null,
        error: {
          message: 'Tu DNI no se encuentra en esta base de datos. Por favor creá una cuenta normal o registrate con Google.'
        }
      };
    }

    var result = await sb.auth.signUp({
      email: authEmailForCustomer(lookup.customer),
      password: password,
      options: {
        data: {
          dni: cleanDni,
          cliente_id: lookup.customer.id,
          name: lookup.customer.name
        }
      }
    });

    if (result.error) {
      var msg = String(result.error.message || '').toLowerCase();
      if (msg.includes('registered') || msg.includes('already')) {
        return { user: null, error: { message: 'Este DNI ya tiene contraseña. Ingresá desde la pestaña Ingresar.' } };
      }
      return { user: null, error: result.error };
    }

    var user = buildAccountUser(lookup.customer, result.data.user);
    if (result.data && result.data.session) {
      var profile = await upsertProfileFromCustomer(result.data.user, lookup.customer);
      if (profile.profile) user = mergeProfileUser(user, profile.profile);
    }

    return {
      user: user,
      needsVerification: !(result.data && result.data.session),
      verificationEmail: authEmailForCustomer(lookup.customer),
      error: null
    };
  }

  async function loginCustomerByDni(dni, password) {
    var sb = getClient();
    var cleanDni = normalizeDni(dni);
    if (!sb) return { user: null, error: { message: 'Supabase no esta disponible.' } };
    if (!cleanDni) return { user: null, error: { message: 'Ingresá un DNI válido.' } };

    var lookup = await fetchCustomerByDni(cleanDni);
    if (lookup.error) return { user: null, error: lookup.error };
    if (!lookup.customer) return { user: null, error: { message: 'No encontramos los datos de ese DNI.' } };

    var auth = await sb.auth.signInWithPassword({
      email: authEmailForCustomer(lookup.customer),
      password: password
    });

    if (auth.error) return { user: null, error: auth.error };

    var profile = await upsertProfileFromCustomer(auth.data.user, lookup.customer);
    var user = buildAccountUser(lookup.customer, auth.data.user);
    if (profile.profile) user = mergeProfileUser(user, profile.profile);

    return { user: user, error: null };
  }

  async function updateCustomerProfile(dni, data) {
    var sb = getClient();
    var cleanDni = normalizeDni(dni);
    if (!sb || !cleanDni) return { customer: null, error: null };

    var payload = {
      nombre: data.firstName || '',
      apellido: data.lastName || '',
      email: data.email || '',
      telefono: data.phone || '',
      direccion: data.address || ''
    };

    var result = await sb
      .from('clientes')
      .update(payload)
      .eq('dni', cleanDni)
      .select('id,dni,nombre,apellido,email,telefono,direccion')
      .maybeSingle();

    if (result.error) {
      console.warn('Supabase guardar cliente error:', result.error.message);
      return { customer: null, error: result.error };
    }

    return { customer: mapCustomer(result.data), error: null };
  }

  async function updateAccountProfile(data) {
    var sb = getClient();
    if (!sb) return { user: null, error: { message: 'Supabase no esta disponible.' } };

    var sessionResult = await sb.auth.getSession();
    if (sessionResult.error) return { user: null, error: sessionResult.error };
    if (!sessionResult.data || !sessionResult.data.session) {
      return {
        user: null,
        error: {
          message: 'Tu email todavía no está verificado. Confirmalo desde tu correo y después iniciá sesión para guardar los datos.'
        }
      };
    }

    var authUser = sessionResult.data.session.user;
    var firstName = data.firstName || '';
    var lastName = data.lastName || '';
    var name = [firstName, lastName].filter(Boolean).join(' ').trim() || data.email || 'Cliente';
    var cleanDni = normalizeDni(data.dni);
    var provider = data.provider || (authUser.app_metadata && authUser.app_metadata.provider) || 'email';
    var clienteId = data.clienteId || null;

    if (!clienteId && cleanDni) {
      var customerLookup = await fetchCustomerByDni(cleanDni);
      if (customerLookup.customer) clienteId = customerLookup.customer.id;
    }

    var profilePayload = {
      user_id: authUser.id,
      cliente_id: clienteId,
      dni: cleanDni || null,
      nombre: firstName,
      apellido: lastName,
      email: data.email || authUser.email || '',
      telefono: data.phone || '',
      direccion: data.address || '',
      provider: provider
    };

    var profileResult = await sb
      .from('perfiles')
      .upsert(profilePayload, { onConflict: 'user_id' })
      .select(PROFILE_COLUMNS)
      .maybeSingle();

    if (profileResult.error) {
      if (profileResult.error.code === '23505') {
        return { user: null, error: { message: 'Ese DNI ya está usado por otra cuenta.' } };
      }
      return { user: null, error: profileResult.error };
    }

    var payload = {
      name: name,
      first_name: firstName,
      last_name: lastName,
      nombre: firstName,
      apellido: lastName,
      dni: data.dni || '',
      profile_email: data.email || '',
      phone: data.phone || '',
      telefono: data.phone || '',
      address: data.address || '',
      direccion: data.address || ''
    };

    var result = await sb.auth.updateUser({ data: payload });
    if (result.error) console.warn('Supabase metadata perfil error:', result.error.message);

    var updatedAuthUser = result.data && result.data.user ? result.data.user : authUser;
    var baseUser = buildEmailAccountUser(updatedAuthUser, {
      email: data.email || updatedAuthUser.email || '',
      provider: provider
    });
    if (provider === 'dni') baseUser.provider = 'dni';

    return {
      user: mergeProfileUser(baseUser, mapProfile(profileResult.data)),
      error: null
    };
  }

  async function signOutAccount() {
    var sb = getClient();
    if (sb) await sb.auth.signOut();
  }

  async function changeAccountPassword(password) {
    var sb = getClient();
    if (!sb) return { error: { message: 'Supabase no esta disponible.' } };
    var result = await sb.auth.updateUser({ password: password });
    return { error: result.error || null };
  }

  function parseMoney(value) {
    var normalized = String(value || '').replace(',', '.');
    var amount = Number(normalized);
    return Number.isFinite(amount) ? amount : 0;
  }

  function isTruthy(value) {
    var normalized = String(value || '').trim().toLowerCase();
    return value === true || normalized === 'true' || normalized === 'si' || normalized === '1' || normalized === '-1';
  }

  function webOrderStatus(row) {
    var payments = Array.isArray(row && row.pagos) ? row.pagos : [];
    var hasRefund = payments.some(function(payment) {
      return String(payment && payment.estado || '').toLowerCase() === 'devuelto';
    });
    if (hasRefund) return { status: 'refunded', label: 'Devuelto' };

    var status = String(row && row.estado || '').toLowerCase();
    if (status === 'entregado') return { status: 'delivered', label: 'Entregado' };
    if (status === 'pagado') return { status: 'shipped', label: 'Pagado' };
    if (status === 'confirmado') return { status: 'shipped', label: 'Confirmado' };
    if (status === 'cancelado') return { status: 'cancelled', label: 'Cancelado' };
    if (status === 'fallido') return { status: 'cancelled', label: 'Fallido' };
    return { status: 'pending', label: 'Pendiente' };
  }

  function orderDateValue(order) {
    var date = new Date(String(order && order.date || '').replace(' ', 'T'));
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  }

  function orderItemSignature(item) {
    var productId = String((item && (item.productId || item.id_productos)) || '').trim();
    var code = String((item && (item.code || item.codigo)) || '').trim();
    var name = String((item && (item.name || item.nombre)) || '').trim().toLowerCase();
    var qty = Number((item && (item.qty || item.cantidad)) || 0);
    var price = Number((item && (item.price || item.precio_unitario)) || 0);
    if (!Number.isFinite(qty)) qty = 0;
    if (!Number.isFinite(price)) price = 0;
    return [productId, code, name, Math.round(qty), price.toFixed(2)].join('|');
  }

  function orderSignature(items, total) {
    var itemKey = (items || []).map(orderItemSignature).sort().join('||');
    var amount = Number(total || 0);
    if (!Number.isFinite(amount)) amount = 0;
    return amount.toFixed(2) + '::' + itemKey;
  }

  function dedupeWebOrders(orders) {
    var completedKeys = {};
    (orders || []).forEach(function(order) {
      if (!order || (order.status !== 'delivered' && order.status !== 'shipped')) return;
      completedKeys[orderSignature(order.items || [], order.total)] = true;
    });

    var pendingKeys = {};
    return (orders || []).filter(function(order) {
      if (!order || order.status !== 'pending') return true;
      var key = orderSignature(order.items || [], order.total);
      if (completedKeys[key] || pendingKeys[key]) return false;
      pendingKeys[key] = true;
      return true;
    });
  }

  function mergeAccountData(base, extra) {
    var out = Object.assign({}, base || {});
    Object.keys(extra || {}).forEach(function(key) {
      var value = extra[key];
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        out[key] = value;
      }
    });
    return out;
  }

  async function fetchWebOrders(limit) {
    var sb = getClient();
    if (!sb) return { orders: [], error: { message: 'Supabase no esta disponible.' } };

    var sessionResult = await sb.auth.getSession();
    if (sessionResult.error) return { orders: [], error: sessionResult.error };
    var session = sessionResult.data && sessionResult.data.session;
    if (!session || !session.user) return { orders: [], error: null };

    var result = await sb
      .from('pedidos')
      .select('id,external_reference,created_at,estado,metodo_pago,cliente_id,dni,nombre,apellido,email,telefono,direccion,subtotal,iva,total,pagos(id,proveedor,estado,external_payment_id,external_preference_id,created_at),pedido_items(id,id_productos,codigo,nombre,descripcion,categoria,subcategoria,imagen_url,precio_unitario,cantidad,subtotal)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(limit || 40);

    if (result.error) return { orders: [], error: result.error };

    var orders = (result.data || []).map(function(row) {
      var state = webOrderStatus(row);
      var items = row.pedido_items || [];
      var buyerName = [row.nombre || '', row.apellido || ''].filter(Boolean).join(' ').trim();
      if (!buyerName) buyerName = row.email || '';
      return {
        id: row.external_reference || row.id,
        rawId: row.id,
        typeLabel: 'Pedido',
        date: row.created_at || '',
        status: state.status,
        statusLabel: state.label,
        paymentMethod: row.metodo_pago || '',
        buyerName: buyerName,
        buyerEmail: row.email || '',
        buyerDni: row.dni || '',
        buyerPhone: row.telefono || '',
        buyerAddress: row.direccion || '',
        clienteId: row.cliente_id || null,
        total: parseMoney(row.total),
        subtotal: parseMoney(row.subtotal),
        tax: parseMoney(row.iva),
        source: 'web',
        payments: row.pagos || [],
        items: items.map(function(item) {
          var qty = Number(item.cantidad || 0);
          var subtotal = parseMoney(item.subtotal);
          return {
            id: item.id,
            productId: item.id_productos || '',
            name: item.nombre || 'Producto',
            code: item.codigo || '',
            qty: qty,
            price: parseMoney(item.precio_unitario),
            subtotal: subtotal,
            image: item.imagen_url || ''
          };
        })
      };
    });

    return {
      orders: dedupeWebOrders(orders),
      error: null
    };
  }

  async function fetchAccountOrders(limit) {
    var sb = getClient();
    if (!sb) return { orders: [], error: { message: 'Supabase no esta disponible.' } };

    var accountResult = await getCurrentAccount();
    if (accountResult.error) return { orders: [], error: accountResult.error };
    var account = accountResult.user || null;
    var clienteId = account && account.clienteId ? account.clienteId : null;

    if (!clienteId) return fetchWebOrders(limit || 40);

    var invoicesQuery = sb
      .from('facturas')
      .select('id_factura,id_cliente,fecha,vendedor,subtotal,descunto,pagotarjeta,total')
      .eq('id_cliente', clienteId)
      .order('fecha', { ascending: false })
      .limit(limit || 40);

    var invoices = await invoicesQuery;

    if (invoices.error) return { orders: [], error: invoices.error };

    var rows = invoices.data || [];
    var invoiceIds = rows.map(function(row) { return row.id_factura; }).filter(Boolean);
    if (!invoiceIds.length) return fetchWebOrders(limit || 40);

    var detailsResult = await sb
      .from('detallefactura')
      .select('id_detallefactura,numerofactura,id_producto,cantidad,subtotal')
      .in('numerofactura', invoiceIds);

    if (detailsResult.error) return { orders: [], error: detailsResult.error };

    var details = detailsResult.data || [];
    var productIds = details
      .map(function(row) { return row.id_producto; })
      .filter(Boolean)
      .filter(function(id, index, arr) { return arr.indexOf(id) === index; });

    var productsById = {};
    if (productIds.length) {
      var productsResult = await sb
        .from('productos')
        .select('id_productos,producto,codigo,descripcion')
        .in('id_productos', productIds);

      if (productsResult.error) return { orders: [], error: productsResult.error };
      (productsResult.data || []).forEach(function(product) {
        productsById[product.id_productos] = product;
      });
    }

    var detailsByInvoice = {};
    details.forEach(function(detail) {
      if (!detailsByInvoice[detail.numerofactura]) detailsByInvoice[detail.numerofactura] = [];
      var product = productsById[detail.id_producto] || {};
      var quantity = parseMoney(detail.cantidad);
      var subtotal = parseMoney(detail.subtotal);
      detailsByInvoice[detail.numerofactura].push({
        id: detail.id_detallefactura,
        name: product.producto || product.descripcion || ('Producto #' + (detail.id_producto || '')),
        code: product.codigo || '',
        qty: quantity,
        price: quantity ? subtotal / quantity : subtotal,
        subtotal: subtotal
      });
    });

    return {
      orders: rows.map(function(row) {
        return {
          id: row.id_factura,
          typeLabel: 'Factura',
          date: row.fecha || '',
          status: 'delivered',
          statusLabel: 'Compra',
          total: parseMoney(row.total),
          subtotal: parseMoney(row.subtotal),
          discount: parseMoney(row.descunto),
          cardPayment: isTruthy(row.pagotarjeta),
          seller: row.vendedor || '',
          buyerName: account.name || '',
          buyerEmail: account.email || '',
          buyerDni: account.dni || '',
          buyerPhone: account.phone || '',
          buyerAddress: account.address || '',
          clienteId: clienteId,
          items: detailsByInvoice[row.id_factura] || []
        };
      }).concat((await fetchWebOrders(limit || 40)).orders || []).sort(function(a, b) {
        return orderDateValue(b) - orderDateValue(a);
      }).slice(0, limit || 40),
      error: null
    };
  }

  async function fetchAccountRepairs(limit) {
    var sb = getClient();
    if (!sb) return { repairs: [], error: { message: 'Supabase no esta disponible.' } };

    var repairsResult = await sb
      .from('ordendereparacion')
      .select('id_ordenes,id_clientes,id_consola,fecha_de_entrada,falla,estado,retirado,usuario')
      .order('fecha_de_entrada', { ascending: false })
      .limit(limit || 40);

    if (repairsResult.error) return { repairs: [], error: repairsResult.error };

    var repairs = repairsResult.data || [];
    var consoleIds = repairs
      .map(function(row) { return row.id_consola; })
      .filter(Boolean)
      .filter(function(id, index, arr) { return arr.indexOf(id) === index; });

    var consolesById = {};
    if (consoleIds.length) {
      var consolesResult = await sb
        .from('consolas')
        .select('id_consola,tipo,modelo,serie,pegatina')
        .in('id_consola', consoleIds);

      if (consolesResult.error) return { repairs: [], error: consolesResult.error };
      (consolesResult.data || []).forEach(function(item) {
        consolesById[item.id_consola] = item;
      });
    }

    return {
      repairs: repairs.map(function(row) {
        var consoleItem = consolesById[row.id_consola] || {};
        var retired = isTruthy(row.retirado);
        var consoleName = [consoleItem.tipo, consoleItem.modelo].filter(Boolean).join(' ');
        var realStatus = row.estado || (retired ? 'Retirado' : '');
        return {
          id: row.id_ordenes,
          date: row.fecha_de_entrada || '',
          status: retired ? 'delivered' : (row.estado ? 'pending' : ''),
          statusLabel: realStatus,
          issue: row.falla || '',
          state: row.estado || '',
          retired: retired,
          consoleName: consoleName,
          serial: consoleItem.serie || '',
          sticker: consoleItem.pegatina || '',
          user: row.usuario || ''
        };
      }),
      error: null
    };
  }

  function mapProduct(row) {
    var stock = row.stock !== null && row.stock !== undefined ? Number(row.stock) : null;

    return {
      id: row.slug,
      name: row.nombre,
      price: Number(row.precio_venta || 0),
      currency: formatCurrency(row.moneda),
      category: row.categoria_slug || '',
      icon: 'inventory_2',
      subtitle: row.descripcion || row.codigo || row.categoria || 'Consultar',
      badge: stock === 0 ? 'Consultar' : '',
      image: row.imagen_url || '',
      source: 'supabase',
      sourceLabel: row.categoria || 'Catalogo',
      sourceFile: 'catalogo.html?sub=' + encodeURIComponent(row.categoria_slug || ''),
      slug: row.slug,
      description: row.descripcion || '',
      stock: stock
    };
  }

  async function fetchProductsByCategorySlugs(slugs) {
    var sb = getClient();
    if (!sb) return [];

    var categorySlugs = slugs.filter(Boolean).filter(function(slug, index, arr) {
      return arr.indexOf(slug) === index;
    });
    if (!categorySlugs.length) return [];

    var result = await sb
      .from('productos')
      .select('id,id_viejo,nombre,slug,codigo,descripcion,imagen_url,categoria,categoria_slug,precio_venta,moneda,stock,activo')
      .eq('activo', true)
      .in('categoria_slug', categorySlugs)
      .order('nombre', { ascending: true });

    if (result.error) {
      console.warn('Supabase productos error:', result.error.message);
      return [];
    }

    return (result.data || []).map(mapProduct);
  }

  function normalizeCatalogText(value) {
    var text = String(value || '').toLowerCase();
    if (text.normalize) {
      text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    return text;
  }

  function catalogSlug(value) {
    return normalizeCatalogText(value)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'catalogo';
  }

  function accessGroupForCategory(category) {
    var text = normalizeCatalogText(category);
    if (text.indexOf('consola') !== -1) return 'consolas';
    if (text.indexOf('periferico') !== -1) return 'perifericos';
    if (text.indexOf('auricular') !== -1 || text.indexOf('parlante') !== -1) return 'audio';
    if (text.indexOf('hardware') !== -1 || text.indexOf('memoria') !== -1 || text.indexOf('pc') !== -1 || text.indexOf('silla') !== -1 || text.indexOf('carry') !== -1 || text.indexOf('disck') !== -1 || text.indexOf('disk') !== -1) return 'hardware';
    return 'accesorios';
  }

  function accessIconForText(category, subcategory, product) {
    var text = normalizeCatalogText([category, subcategory, product].filter(Boolean).join(' '));
    if (text.indexOf('auricular') !== -1 || text.indexOf('headset') !== -1) return 'headset_mic';
    if (text.indexOf('parlante') !== -1) return 'speaker';
    if (text.indexOf('ram') !== -1 || text.indexOf('procesador') !== -1 || text.indexOf('mother') !== -1) return 'memory';
    if (text.indexOf('memoria') !== -1 || text.indexOf('disco') !== -1 || text.indexOf('carry') !== -1 || text.indexOf('disck') !== -1 || text.indexOf('disk') !== -1 || text.indexOf('pendrive') !== -1) return 'storage';
    if (text.indexOf('cable') !== -1) return 'cable';
    if (text.indexOf('adaptador') !== -1) return 'device_hub';
    if (text.indexOf('joystick') !== -1) return 'gamepad';
    if (text.indexOf('consola') !== -1 || text.indexOf('ps') !== -1 || text.indexOf('xbox') !== -1 || text.indexOf('nintendo') !== -1) return 'sports_esports';
    if (text.indexOf('silla') !== -1) return 'chair';
    if (text.indexOf('mouse') !== -1) return 'mouse';
    if (text.indexOf('teclado') !== -1) return 'keyboard';
    if (text.indexOf('monitor') !== -1) return 'desktop_windows';
    return 'inventory_2';
  }

  function priorityFromList(text, list) {
    var normalized = normalizeCatalogText(text);
    for (var i = 0; i < list.length; i++) {
      var item = normalizeCatalogText(list[i]);
      if (normalized === item) return i;
      if (normalized.indexOf(item) !== -1) return i + 0.1;
    }
    return 999;
  }

  function accessCategoryPriority(category) {
    return priorityFromList(category, [
      'Consolas de juegos',
      'Accesorios Consolas',
      'Hardware',
      'Perifericos PC',
      'Memorias',
      'Auriculares',
      'Cables',
      'Adaptadores',
      'Accesorio Celular',
      'Silla Gamer',
      'Parlantes',
      'Otros'
    ]);
  }

  function accessSubcategoryPriority(category, subcategory) {
    var cat = normalizeCatalogText(category);
    var order = [];

    if (cat.indexOf('consolas de juegos') !== -1) {
      order = [
        'Consola Ps5',
        'Consola PS4',
        'Consola PS3',
        'Consola Ps2',
        'Consola Xbox Serie',
        'Consola Xbox One',
        'Consola Xbox 360',
        'Consola Nintendo',
        'Consolas Retro'
      ];
    } else if (cat.indexOf('accesorios consolas') !== -1) {
      order = [
        'Ps5',
        'Ps4',
        'Ps3',
        'Ps2',
        'Xbox One',
        'Xbox 360',
        'Xbox Serie',
        'Nintendo'
      ];
    } else if (cat.indexOf('hardware') !== -1) {
      order = [
        'Procesador',
        'Placa Madre',
        'Disco SSD',
        'Disco Rigido',
        'Carry Disco 2.55',
        'Carry Disco 3.55',
        'Fuentes',
        'Gabinetes',
        'Red',
        'Pasta Termica',
        'Otros'
      ];
    } else if (cat.indexOf('perifericos pc') !== -1) {
      order = [
        'Combos Perifericos',
        'Monitor',
        'Teclados',
        'Mouse',
        'PadMouse',
        'Joystick PC',
        'Microfono'
      ];
    } else if (cat.indexOf('memorias') !== -1) {
      order = ['Pendrive', 'Memoria Flash'];
    } else if (cat.indexOf('auriculares') !== -1) {
      order = ['Auricular Gamer', 'Auricular tipo vincha', 'Auricular in ear', 'Adaptador Auricular'];
    } else if (cat.indexOf('cables') !== -1) {
      order = ['Cable HDMI', 'Cable USB', 'Cable de Red', 'Cable Corriente', 'Cable Vga', 'Cable Plug'];
    } else if (cat.indexOf('accesorio celular') !== -1) {
      order = ['Cables Celular', 'PowerBank', 'Joystick Celular'];
    }

    return priorityFromList(subcategory, order);
  }

  function compareCatalogItems(a, b) {
    var priorityDiff = accessCategoryPriority(a.name) - accessCategoryPriority(b.name);
    if (priorityDiff !== 0) return priorityDiff;
    var productDiff = Number(b.productCount || 0) - Number(a.productCount || 0);
    if (productDiff !== 0) return productDiff;
    return a.name.localeCompare(b.name, 'es');
  }

  function compareSubcategoryItems(categoryName, a, b) {
    var priorityDiff = accessSubcategoryPriority(categoryName, a.name) - accessSubcategoryPriority(categoryName, b.name);
    if (priorityDiff !== 0) return priorityDiff;
    var productDiff = Number(b.productCount || 0) - Number(a.productCount || 0);
    if (productDiff !== 0) return productDiff;
    return a.name.localeCompare(b.name, 'es');
  }

  function isPcStorageSubcategory(subcategory) {
    var text = normalizeCatalogText(subcategory);
    return text === 'disco ssd' || text === 'disco rigido' || text === 'carry disco 2.55' || text === 'carry disco 3.55';
  }

  function isPcPeripheralSubcategory(subcategory) {
    var text = normalizeCatalogText(subcategory);
    return [
      'combos pc',
      'combos perifericos',
      'monitor',
      'teclados',
      'mouse',
      'padmouse',
      'joystick pc',
      'microfono'
    ].indexOf(text) !== -1;
  }

  function isPcHardwareSubcategory(subcategory) {
    var text = normalizeCatalogText(subcategory);
    return [
      'procesador',
      'placa madre',
      'fuentes',
      'gabinetes',
      'pasta termica'
    ].indexOf(text) !== -1;
  }

  function accessDisplaySubcategoryForRow(row) {
    var subcategory = row.subcategoria || 'Subcategoria';
    var categoryText = normalizeCatalogText(row.categoria || '');
    var subcategoryText = normalizeCatalogText(subcategory);

    if (categoryText === 'accesorio pc' && subcategoryText === 'combos pc') {
      return 'Combos Perifericos';
    }

    return subcategory;
  }

  function accessDisplayCategoryForRow(row) {
    var category = row.categoria || 'Categoria';
    var categoryText = normalizeCatalogText(category);
    var subcategory = row.subcategoria || '';

    if (categoryText === 'memorias' && isPcStorageSubcategory(subcategory)) {
      return 'Hardware';
    }

    if (categoryText === 'carry disck' || categoryText === 'carry disk') {
      return 'Hardware';
    }

    if (categoryText === 'accesorio pc' && isPcHardwareSubcategory(subcategory)) {
      return 'Hardware';
    }

    if (categoryText === 'accesorio pc' && isPcPeripheralSubcategory(subcategory)) {
      return 'Perifericos PC';
    }

    if (categoryText === 'accesorio pc') {
      return 'Hardware';
    }

    return category;
  }

  function removeLeadingAccessCode(text, code) {
    var value = String(text || '').trim();
    code = String(code || '').trim();
    if (!value || !code) return value;

    var normalizedValue = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    var normalizedCode = code.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    var codeIndex = normalizedValue.indexOf(normalizedCode);

    if (normalizedValue.indexOf('codigo ' + normalizedCode) === 0 && codeIndex !== -1) {
      return value.slice(codeIndex + code.length).replace(/^[\s.\-:]+/, '').trim();
    }
    if (normalizedValue.indexOf(normalizedCode) === 0) {
      return value.slice(code.length).replace(/^[\s.\-:]+/, '').trim();
    }
    return value;
  }

  function mapAccessProduct(row) {
    var id = String(row.id_productos || '').trim();
    var name = row.producto || row.descripcion || ('Producto #' + id);
    var category = accessDisplayCategoryForRow(row);
    var subcategory = accessDisplaySubcategoryForRow(row);
    var code = row.codigo ? String(row.codigo).trim() : '';
    var description = row.descripcion && row.descripcion !== name ? removeLeadingAccessCode(row.descripcion, code) : '';
    var subtitle = description || subcategory;
    var group = accessGroupForCategory(category);

    return {
      id: id,
      accessId: id,
      name: name,
      price: parseMoney(row.precio_de_venta),
      currency: formatCurrency('ARS'),
      category: group,
      rootCategory: group,
      subcategoryId: row.id_subcategoria2 || '',
      icon: accessIconForText(category, subcategory, name),
      subtitle: subtitle,
      badge: '',
      image: row.imagen_url || '',
      source: 'access',
      sourceLabel: subcategory,
      sourceFile: 'catalogo.html?sub=' + encodeURIComponent('subcat-' + (row.id_subcategoria2 || '')),
      slug: 'access-' + id,
      codigo: code,
      code: code,
      description: description || subcategory,
      stock: row.totalproductos !== null && row.totalproductos !== undefined ? parseMoney(row.totalproductos) : null,
      brand: row.marca || '',
      model: code || subcategory
    };
  }

  async function fetchAccessCatalogTree() {
    var sb = getClient();
    if (!sb) return [];

    var result = await sb.rpc('catalogo_categorias_access');
    if (result.error) {
      console.warn('Supabase catalogo categorias error:', result.error.message);
      return [];
    }

    var byCategory = {};
    (result.data || []).forEach(function(row) {
      var categoryId = String(row.id_categoria || '').trim();
      var subcategoryId = String(row.id_subcategoria2 || '').trim();
      if (!categoryId || !subcategoryId) return;

      var displayCategory = accessDisplayCategoryForRow(row);
      var displaySubcategory = accessDisplaySubcategoryForRow(row);
      var rootId = 'cat-' + catalogSlug(displayCategory);
      if (!byCategory[rootId]) {
        byCategory[rootId] = {
          id: rootId,
          accessCategoryId: null,
          accessCategoryIds: [],
          name: displayCategory,
          category: accessGroupForCategory(displayCategory),
          icon: accessIconForText(displayCategory, '', ''),
          subtitle: '',
          image: '',
          productCount: 0,
          useChildrenForProducts: true,
          children: []
        };
      }

      var count = Number(row.product_count || 0);
      if (byCategory[rootId].accessCategoryIds.indexOf(categoryId) === -1) {
        byCategory[rootId].accessCategoryIds.push(categoryId);
      }
      byCategory[rootId].productCount += count;
      byCategory[rootId].children.push({
        id: 'subcat-' + subcategoryId,
        accessSubcategoryId: subcategoryId,
        name: displaySubcategory,
        category: byCategory[rootId].category,
        icon: accessIconForText(displayCategory, displaySubcategory, ''),
        subtitle: count === 1 ? '1 producto' : count + ' productos',
        image: '',
        productCount: count,
        children: null
      });
    });

    return Object.values(byCategory).map(function(item) {
      item.children.sort(function(a, b) { return compareSubcategoryItems(item.name, a, b); });
      item.subtitle = item.productCount + ' productos en ' + item.children.length + ' subcategorias';
      return item;
    }).sort(compareCatalogItems);
  }

  async function fetchAccessProductsBySubcategory(subcategoryId) {
    var sb = getClient();
    if (!sb || !subcategoryId) return [];

    var result = await sb.rpc('catalogo_productos_access', { subcategoria_id: String(subcategoryId) });
    if (result.error) {
      console.warn('Supabase catalogo productos error:', result.error.message);
      return [];
    }

    return (result.data || []).map(mapAccessProduct);
  }

  async function fetchAccessProductsByCategory(categoryId) {
    var sb = getClient();
    if (!sb || !categoryId) return [];

    var result = await sb.rpc('catalogo_productos_categoria_access', { categoria_id: String(categoryId) });
    if (result.error) {
      console.warn('Supabase catalogo categoria productos error:', result.error.message);
      return [];
    }

    return (result.data || []).map(mapAccessProduct);
  }

  async function fetchAccessProductById(productId) {
    var sb = getClient();
    if (!sb || !productId) return null;

    var result = await sb.rpc('catalogo_producto_access', { producto_id: String(productId) });
    if (result.error) {
      console.warn('Supabase catalogo producto error:', result.error.message);
      return null;
    }

    var row = Array.isArray(result.data) ? result.data[0] : result.data;
    return row ? mapAccessProduct(row) : null;
  }

  async function fetchProductBySlug(slug) {
    var sb = getClient();
    if (!sb || !slug) return null;

    var accessMatch = String(slug).match(/^access-(.+)$/);
    if (accessMatch) return fetchAccessProductById(accessMatch[1]);

    var result = await sb
      .from('productos')
      .select('id,id_viejo,nombre,slug,codigo,descripcion,imagen_url,categoria,categoria_slug,precio_venta,moneda,stock,activo')
      .eq('activo', true)
      .eq('slug', slug)
      .maybeSingle();

    if (result.error) {
      console.warn('Supabase producto error:', result.error.message);
      return null;
    }
    return result.data ? mapProduct(result.data) : null;
  }

  function parseCartProductId(item) {
    var directId = item && (item.accessId || item.id_productos || item.productId);
    if (directId !== null && directId !== undefined && directId !== '') return String(directId);

    var id = String((item && item.id) || '').trim();
    var accessMatch = id.match(/^access-(.+)$/);
    return accessMatch ? accessMatch[1] : id;
  }

  function mapOrderItem(item) {
    var price = Number((item && item.price) || 0);
    var qty = Number((item && item.qty) || 1);
    if (!Number.isFinite(price) || price < 0) price = 0;
    if (!Number.isFinite(qty) || qty < 1) qty = 1;
    qty = Math.round(qty);

    return {
      id_productos: parseCartProductId(item) || null,
      codigo: (item && (item.code || item.codigo || item.ref)) || null,
      nombre: (item && item.name) || 'Producto',
      descripcion: (item && (item.description || item.subtitle)) || null,
      categoria: (item && item.category) || null,
      subcategoria: (item && item.sourceLabel) || null,
      imagen_url: (item && item.image) || null,
      precio_unitario: price,
      cantidad: qty,
      subtotal: price * qty
    };
  }

  async function getAccessToken() {
    var sb = getClient();
    if (!sb) return '';

    var sessionResult = await sb.auth.getSession();
    if (sessionResult.error) return '';

    var session = sessionResult.data && sessionResult.data.session;
    return session && session.access_token ? session.access_token : '';
  }

  async function findMatchingPendingOrder(sb, userId, method, itemRows, total) {
    var result = await sb
      .from('pedidos')
      .select('id,external_reference,estado,metodo_pago,subtotal,iva,total,created_at,pedido_items(id,id_productos,codigo,nombre,precio_unitario,cantidad,subtotal)')
      .eq('user_id', userId)
      .eq('estado', 'pendiente')
      .eq('metodo_pago', method || 'whatsapp')
      .order('created_at', { ascending: false })
      .limit(12);

    if (result.error) return null;

    var targetSignature = orderSignature(itemRows.map(function(item) {
      return {
        productId: item.id_productos || '',
        code: item.codigo || '',
        name: item.nombre || '',
        qty: item.cantidad || 0,
        price: item.precio_unitario || 0
      };
    }), total);

    var rows = result.data || [];
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var items = (row.pedido_items || []).map(function(item) {
        return {
          productId: item.id_productos || '',
          code: item.codigo || '',
          name: item.nombre || '',
          qty: Number(item.cantidad || 0),
          price: parseMoney(item.precio_unitario),
          subtotal: parseMoney(item.subtotal)
        };
      });
      if (orderSignature(items, row.total) === targetSignature) {
        return Object.assign({}, row, { items: row.pedido_items || [], reused: true });
      }
    }

    return null;
  }

  async function createWebOrder(data) {
    var sb = getClient();
    if (!sb) return { order: null, error: { message: 'Supabase no esta disponible.' } };

    var items = (data && data.items) || [];
    if (!items.length) return { order: null, error: { message: 'El carrito esta vacio.' } };

    var sessionResult = await sb.auth.getSession();
    if (sessionResult.error) return { order: null, error: sessionResult.error };
    var session = sessionResult.data && sessionResult.data.session;
    if (!session || !session.user) {
      return { order: null, error: { message: 'Inicia sesion para guardar el pedido.' } };
    }

    var account = (data && data.account) || {};
    try {
      var freshAccount = await getCurrentAccount();
      if (freshAccount && freshAccount.user) account = mergeAccountData(account, freshAccount.user);
    } catch (error) {
      console.warn('No se pudo completar la cuenta antes de crear pedido:', error);
    }

    var totals = (data && data.totals) || {};
    var itemRows = items.map(mapOrderItem);
    var fallbackSubtotal = itemRows.reduce(function(sum, item) { return sum + Number(item.subtotal || 0); }, 0);
    var subtotal = Number(totals.subtotal);
    var iva = Number(totals.iva);
    var total = Number(totals.total);
    if (!Number.isFinite(subtotal)) subtotal = fallbackSubtotal;
    if (!Number.isFinite(iva)) iva = 0;
    if (!Number.isFinite(total)) total = subtotal + iva;

    var method = (data && data.method) || 'whatsapp';
    var buyerNotes = [
      account.name ? 'Cliente: ' + account.name : '',
      account.email || session.user.email ? 'Email: ' + (account.email || session.user.email) : '',
      normalizeDni(account.dni) ? 'DNI: ' + normalizeDni(account.dni) : ''
    ].filter(Boolean).join(' | ');
    var notes = [(data && data.notes) || '', buyerNotes].filter(Boolean).join(' - ');

    var existingPending = await findMatchingPendingOrder(sb, session.user.id, method, itemRows, total);
    if (existingPending) {
      return {
        order: existingPending,
        reused: true,
        error: null
      };
    }

    var orderPayload = {
      user_id: session.user.id,
      cliente_id: account.clienteId || null,
      dni: normalizeDni(account.dni) || null,
      nombre: account.firstName || account.name || '',
      apellido: account.lastName || '',
      email: account.email || session.user.email || '',
      telefono: account.phone || '',
      direccion: account.address || '',
      estado: 'pendiente',
      metodo_pago: method,
      subtotal: subtotal,
      iva: iva,
      total: total,
      moneda: cfg.CURRENCY || 'ARS',
      notas: notes || null
    };

    var orderResult = await sb
      .from('pedidos')
      .insert(orderPayload)
      .select('id,external_reference,estado,metodo_pago,subtotal,iva,total,created_at')
      .single();

    if (orderResult.error) return { order: null, error: orderResult.error };

    var rows = itemRows.map(function(item) {
      return Object.assign({}, item, { pedido_id: orderResult.data.id });
    });

    var itemsResult = await sb
      .from('pedido_items')
      .insert(rows)
      .select('id,pedido_id,id_productos,nombre,cantidad,subtotal');

    if (itemsResult.error) {
      return {
        order: orderResult.data,
        error: {
          message: 'El pedido se creo, pero no se pudieron guardar los productos: ' + itemsResult.error.message
        }
      };
    }

    return {
      order: Object.assign({}, orderResult.data, { items: itemsResult.data || [] }),
      error: null
    };
  }

  window.SupabaseStore = {
    isReady: isReady,
    fetchCustomerByDni: fetchCustomerByDni,
    fetchProfileByUserId: fetchProfileByUserId,
    registerEmailAccount: registerEmailAccount,
    loginEmailAccount: loginEmailAccount,
    signInWithGoogle: signInWithGoogle,
    getCurrentAccount: getCurrentAccount,
    registerCustomerByDni: registerCustomerByDni,
    loginCustomerByDni: loginCustomerByDni,
    updateAccountProfile: updateAccountProfile,
    updateCustomerProfile: updateCustomerProfile,
    signOutAccount: signOutAccount,
    changeAccountPassword: changeAccountPassword,
    fetchAccountOrders: fetchAccountOrders,
    fetchAccountRepairs: fetchAccountRepairs,
    fetchProductsByCategorySlugs: fetchProductsByCategorySlugs,
    fetchAccessCatalogTree: fetchAccessCatalogTree,
    fetchAccessProductsByCategory: fetchAccessProductsByCategory,
    fetchAccessProductsBySubcategory: fetchAccessProductsBySubcategory,
    fetchAccessProductById: fetchAccessProductById,
    fetchProductBySlug: fetchProductBySlug,
    getAccessToken: getAccessToken,
    createWebOrder: createWebOrder
  };
})();
