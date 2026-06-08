// producto-imagenes-juegos-extra.js - portadas extra para juegos fisicos sin match en DixGamer.
(function() {
  var existing = window.DT_PRODUCT_IMAGE_MAP || {};
  var extraById = {
    "891": "https://assets.nintendo.com/image/upload/q_auto/f_auto/store/software/switch/70010000072954/00eac347ef3029bfe156b030be64c0274cd5dea1df4df57b12855c823ef7deb4",
    "763": "https://image.api.playstation.com/cdn/EP0001/CUSA03440_00/lmeQAO0LG340rl1NmwXyEOuiPCaoOCj1.png",
    "187": "https://cdn.akamai.steamstatic.com/steam/apps/394230/library_600x900.jpg",
    "217": "https://cdn.akamai.steamstatic.com/steam/apps/584350/header.jpg",
    "179": "https://cdn.akamai.steamstatic.com/steam/apps/273350/library_600x900.jpg",
    "233": "https://image.api.playstation.com/vulcan/ap/rnd/202010/0205/Pa3yRhSR9PXB5ZsENapb3K5X.png",
    "677": "https://cdn.akamai.steamstatic.com/steam/apps/370240/library_600x900.jpg",
    "786": "https://image.api.playstation.com/cdn/UP0700/CUSA07345_00/dy6Mq84S7NaFMzxjkR5csaqn11doB2Bt.png",
    "742": "https://image.api.playstation.com/cdn/UP9000/CUSA01047_00/XUMI7tohtY97NG57Aj6UAvrYKxFA9e2C.png",
    "209": "https://image.api.playstation.com/cdn/UP9000/CUSA01047_00/XUMI7tohtY97NG57Aj6UAvrYKxFA9e2C.png",
    "723": "https://image.api.playstation.com/cdn/UP4321/CUSA04868_00/EaRZc15UUFs2f9jeKSu6bN2y91YMu62w.png",
    "207": "https://image.api.playstation.com/gs2-sec/appkgo/prod/CUSA08097_00/2/i_a37599017b2c621f9669719d9efe342c56b844920803e908951a129701b2c851/i/icon0.png",
    "787": "https://image.api.playstation.com/vulcan/img/cfn/11307bGedQyeRZJAkHGHtYZLIpSgyRXqcbip4_mK_jjQzpIwzvoKgkEHfQfa-6Mn7hZKQwxm_dKBzN8vgabBUX4jq9IU_qMk.png",
    "225": "https://image.api.playstation.com/vulcan/ap/rnd/202602/1216/e1b7ea35e5dc8d563f7c778c57055528b31eb9763ff0391e.png",
    "975": "https://image.api.playstation.com/vulcan/ap/rnd/202107/3100/HO8vkO9pfXhwbHi5WHECQJdN.png",
    "976": "https://image.api.playstation.com/vulcan/img/rnd/202107/0508/wg0gD2XINJXeJox3mrYSRoqA.png",
    "977": "https://image.api.playstation.com/vulcan/ap/rnd/202008/1020/T45iRN1bhiWcJUzST6UFGBvO.png",
    "973": "https://image.api.playstation.com/vulcan/ap/rnd/202111/2000/B3Xbu6aW10scvc4SE7yXA1lZ.png",
    "970": "https://image.api.playstation.com/vulcan/ap/rnd/202007/0217/OX5mEmwgRPeSQrhGFU3n4moZ.png",
    "971": "https://image.api.playstation.com/cdn/UP1004/CUSA03041_00/Hpl5MtwQgOVF9vJqlfui6SDB5Jl4oBSq.png",
    "972": "https://image.api.playstation.com/vulcan/ap/rnd/202202/2816/mYn2ETBKFct26V9mJnZi4aSS.png"
  };
  var extraByCode = {
    "4902370552171": extraById["891"],
    "887256019525": extraById["763"],
    "710425474798": extraById["187"],
    "814290013868": extraById["217"],
    "710425476983": extraById["179"],
    "083717203292": extraById["233"],
    "5026555421232": extraById["677"],
    "722674122139": extraById["786"],
    "711719512455": extraById["742"],
    "711719526346": extraById["209"],
    "816293016143": extraById["723"],
    "711719509172": extraById["207"],
    "722674120906": extraById["787"],
    "3004374AC": extraById["225"],
    "711719548034": extraById["975"],
    "884095202125": extraById["976"],
    "711719542292": extraById["977"],
    "711719547006": extraById["973"],
    "887256090708": extraById["970"],
    "710425478901": extraById["971"],
    "710425570360": extraById["972"]
  };

  window.DT_PRODUCT_IMAGE_MAP = Object.assign({}, existing, {
    meta: Object.assign({}, existing.meta || {}, {
      juegosExtra: {
        generatedAt: "2026-06-08T00:00:00.000Z",
        source: "official-playstation-nintendo-steam",
        totalItems: Object.keys(extraById).length
      }
    }),
    byId: Object.assign({}, existing.byId || {}, extraById),
    byCode: Object.assign({}, existing.byCode || {}, extraByCode)
  });
}());
