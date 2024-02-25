//导入
mapboxgl.accessToken =
  "pk.eyJ1Ijoic3VwZXJub3ZhMTciLCJhIjoiY2xyNmVpM2dlMmcwbTJsbnZ1d2tvd25qcSJ9.lsN3-AJpJacWGJOIAiJzSQ";
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v10",
  center: [-73.754968, 42.6511674],
  zoom: 6.5
});

//集合所有url
const themes = {
  good: "mapbox://styles/supernova17/cls7yf8at01at01pe5qccbnw7",
  moderate: "mapbox://styles/supernova17/cls81fzh3018g01plf4ak05ne",
  unhealthy: "mapbox://styles/supernova17/cls84mqtp01ef01r4aby591r2",
  aqi: "mapbox://styles/supernova17/cls81g6fh01ek01qyetal0oh6",
  ozone: "mapbox://styles/supernova17/cls86y5ti01ep01qy7tt019qy",
  pm: "mapbox://styles/supernova17/cls861pvl01eo01qy2qbye36h"
};
// 集合示例图例数据
const legendsData = {
  good: {
    layers: ["<180", "200", "220", "240", "260", "280", "300", "330", "350"],
    colors: [
      "#ffffff",
      "#e6f5f9",
      "#ccece6",
      "#99d8c9",
      "#66c2a4",
      "#41ae76",
      "#238b45",
      "#006d2c",
      "#00441b"
    ]
  },
  moderate: {
    layers: ["<10", "20", "30", "40", "50", "60", "70", "80", "90"],
    colors: [
      "#fff5eb",
      "#fdae6b",
      "#fd8d3c",
      "#f6670e",
      "#df5d0c",
      "#d94801",
      "#a63603",
      "#7f2704",
      "#3f261c"
    ]
  },
  unhealthy: {
    layers: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    colors: [
      "#fff5f0",
      "#fcbba1",
      "#fc9272",
      "#fb6a4a",
      "#ef3b2c",
      "#cb181d",
      "#a50f15",
      "#3c0b12",
      "#67000d",
      "#3c0b12"
    ]
  },
  aqi: {
    layers: ["43", "45", "50", "55", "60", "65"],
    colors: ["#1a9850", "#66bd63", "#ffffbf", "#fee08b", "#ffc933", "#fdae61"]
  },
  ozone: {
    layers: ["0", "25", "50", "75", "100", "125", "150", "175", "200", "300"],
    colors: [
      "#00787e",
      "#059a65",
      "#85bd4b",
      "#ffdd33",
      "#ffba33",
      "#fe9633",
      "#e44933",
      "#ca0035",
      "#970068",
      "#78003f"
    ]
  },
  pm: {
    layers: ["0", "25", "50", "75", "100", "125", "150", "175", "200", "300"],
    colors: [
      "#00787e",
      "#059a65",
      "#85bd4b",
      "#ffdd33",
      "#ffba33",
      "#fe9633",
      "#e44933",
      "#ca0035",
      "#970068",
      "#78003f"
    ]
  }
};

//加载地图时更新主题和年份
map.on("load", function () {
  updateThemeAndYear();
});
//具体url切换函数
document.querySelectorAll('input[name="theme"]').forEach((input) => {
  input.addEventListener("change", function () {
    updateThemeAndYear();
  });
});
//具体layer的切换函数
document.getElementById("yearRange").addEventListener("input", function () {
  document.getElementById("yearLabel").innerText = `${this.value}`;
  updateYearLayer(this.value);
});
//根据所选的年份更新地图上的图层可见性
function updateYearLayer(selectedYear) {
  const layers = map.getStyle().layers;
  layers.forEach((layer) => {
    if (layer.id === selectedYear) {
      map.setLayoutProperty(layer.id, "visibility", "visible");
    } else if (!isNaN(layer.id) && layer.id.length === 4) {
      map.setLayoutProperty(layer.id, "visibility", "none");
    }
  });

  const features = map.queryRenderedFeatures({ layers: [selectedYear] });
  features.forEach((feature, index) => {
    map.setFeatureState(
      {
        source: feature.source,
        sourceLayer: feature.sourceLayer,
        id: feature.id
      },
      { id: index }
    );
  });
}

//根据切换的主题和年份来更新地图的样式，更新图例
function updateThemeAndYear() {
  const selectedTheme = document.querySelector('input[name="theme"]:checked')
    .value;
  const selectedYear = document.getElementById("yearRange").value;
  map.setStyle(themes[selectedTheme]);
  // 更新图例
  updateLegend(selectedTheme);
  map.once("style.load", function () {
    updateYearLayer(selectedYear);
  });
  function updateLegend(selectedTheme) {
    const legend = document.getElementById("legend");
    legend.innerHTML = "";

    // 假设每个主题都有对应的图例数据
    const legendData = legendsData[selectedTheme];

    // 生成新的图例项
    legendData.layers.forEach((layer, i) => {
      const item = document.createElement("div");
      const key = document.createElement("span");
      key.className = "legend-key";
      key.style.backgroundColor = legendData.colors[i];

      const value = document.createElement("span");
      value.innerHTML = layer;
      item.appendChild(key);
      item.appendChild(value);
      legend.appendChild(item);
    });
  }
}

//namelist
// 获得当前可见图层
function getCurrentVisibleLayer() {
  const layers = map.getStyle().layers;
  for (const layer of layers) {
    const visibility = map.getLayoutProperty(layer.id, "visibility");
    if (visibility === "visible") {
      return layer.id;
    }
  }
  return null;
}
// 添加点击名称时的事件监听器
function readCurrentPageData() {
  const currentLayerId = getCurrentVisibleLayer();
  const namesList = document.getElementById("namesList");
  const namesSet = new Set(); // 使用Set来存储已添加的名称，以避免重复
  namesList.innerHTML = "";

  if (currentLayerId) {
    const features = map.queryRenderedFeatures({ layers: [currentLayerId] });
    features.forEach((feature) => {
      if (
        feature.properties &&
        feature.properties.NAME &&
        !namesSet.has(feature.properties.NAME)
      ) {
        namesSet.add(feature.properties.NAME);
        const listItem = document.createElement("li");
        listItem.textContent = feature.properties.NAME;
        listItem.addEventListener("click", () => {
          const featureId = feature.id;
          highlightFeatureById(featureId);
        });
        namesList.appendChild(listItem);
      }
    });

    if (namesSet.size === 0) {
      namesList.innerHTML = "<li>No features found.</li>";
    }
  } else {
    namesList.innerHTML = "<li>No visible layer found.</li>";
  }
}
// 修改 moveend 事件监听器以确保在地图移动时也更新数据
map.on("moveend", () => {
  readCurrentPageData();
});

//悬停强调

//悬停信息
map.on("mousemove", (event) => {
  const layers = ["2018", "2019", "2020", "2021", "2022"];
  const features = map.queryRenderedFeatures(event.point, { layers });

  // 获取当前选中的主题
  const selectedTheme = document.querySelector('input[name="theme"]:checked')
    .value;

  if (features.length > 0) {
    const feature = features[0];
    let content = `<h3>${feature.properties.NAME}</h3>`;

    // 遍历特征的所有属性
    Object.keys(feature.properties).forEach((key) => {
      // 检查字段名是否包含当前选中的主题名称
      if (key.toLowerCase().includes(selectedTheme)) {
        content += `<p>${key}: <strong>${feature.properties[key]}</strong></p>`;
      }
    });

    document.getElementById("pd").innerHTML = content;
  } else {
    document.getElementById(
      "pd"
    ).innerHTML = `<p>No data available for this region.</p>`;
  }
});

//其他控件
const geocoder = new MapboxGeocoder({
  // Initialize the geocoder
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl,
  marker: false,
  placeholder: "Search for places in New York State",
  proximity: {
    longitude: -73.754968,
    latitude: 42.6511674
  }
});

map.addControl(geocoder, "bottom-left");
map.addControl(new mapboxgl.NavigationControl(), "bottom-left");
map.addControl(
  new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true,
    showUserHeading: true
  }),
  "bottom-left"
);

//bilichi
const scale = new mapboxgl.ScaleControl({
  maxWidth: 100,
  unit: "metric"
});
map.addControl(scale, "top-right");

//按钮
document.getElementById("toggleSidebar").addEventListener("click", function () {
  var sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("sidebar-hidden");
});

//按钮移动
document.getElementById("toggleSidebar").addEventListener("click", function () {
  var sidebar = document.getElementById("sidebar");
  var btn = document.getElementById("toggleSidebar");
  var legend = document.getElementById("legend");

  sidebar.classList.toggle("collapsed");

  if (sidebar.classList.contains("collapsed")) {
    btn.style.right = "20px";
    legend.style.right = "20px";
  } else {
    btn.style.right = "300px";
    legend.style.right = "320px";
  }
});