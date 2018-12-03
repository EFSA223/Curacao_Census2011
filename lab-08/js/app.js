(function () {

  var map = L.map('map', {
    //zoomSnap: .1,
    center: [12.1789, -68.9748],
    zoom: 14,
    minZoom: 11,
    maxZoom: 15,
    maxBounds: L.latLngBounds([11.9187, -69.1515], [12.3943, -68.7040])
  });

  var accessToken = 'pk.eyJ1IjoiZWYtc2FtYm8iLCJhIjoiY2pvMjZ3ZW00MGU2MzNwcW56aWRsdjBlbiJ9.yaVVbJMunXI_jof-4qb21w'

  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + accessToken, {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 15,
    id: 'mapbox.light',
    accessToken: accessToken
  }).addTo(map);
  
  var dataG1 = 'data/G1_Census2011.csv',
      dataG2 = 'data/G2_Census2011.csv',
      dataG3 = 'data/G3_Census2011.csv',
      dataG8 = 'data/G8_Census2011.csv'
 
//  var mapTypes = ["G1 - Population by geozone, age and sex",
//                  "G2 - Native-born and foreign-born population by geozone and sex",
//                  "G3 - Population by geozone, nationality and sex"];
  
//  use omnivore to load the CSV data
//  omnivore.csv(dataG1)
//    .on('ready', function (e) {
//      console.log(e.target.toGeoJSON())
//      drawMap(e.target.toGeoJSON());
//      drawLegend(e.target.toGeoJSON());
//    })
//    .on('error', function (e) {
//      console.log(e.error[0].message);
//    })
// 
  //=============
          var mapTypes = ["G1","G2","G3"];
  //var mapTypes = 2;
  console.log(mapTypes);
  switch(mapTypes[2]) {
    case "G1":
      omnivore.csv(dataG1)
      .on('ready', function (e) {
      console.log(e.target.toGeoJSON())
      drawMap(e.target.toGeoJSON());
      drawLegend(e.target.toGeoJSON());
      addFilter(mapTypes);
    })
      .on('error', function (e) {
      console.log(e.error[0].message);
    })
        break;
    case "G2":
      omnivore.csv(dataG2)
      .on('ready', function (e) {
      console.log(e.target.toGeoJSON())
      drawMap(e.target.toGeoJSON());
      drawLegend(e.target.toGeoJSON());
      addFilter(mapTypes);
    })
      .on('error', function (e) {
      console.log(e.error[0].message);
    })
        break;
    case "G3":
      omnivore.csv(dataG3)
      .on('ready', function (e) {
      console.log(e.target.toGeoJSON())
      drawMap(e.target.toGeoJSON());
      drawLegend(e.target.toGeoJSON());
      addFilter(mapTypes);       
    })
      .on('error', function (e) {
      console.log(e.error[0].message);
    })
        break;      
//    default:
//        code block
}
 
  //==============
  
//        var dropdown = d3.select('#map')
//        .append('select')  // append a new select element
//        .attr('class', 'filter')  // add a class name
//      //  .on('change', onchange)  // listen for change

        
//        var mapTypes = ["G1","G2","G3"];
//        var mapTypes = ["G1 - Population by geozone, age and sex",
//                        "G2 - Native-born and foreign-born population by geozone and sex",
//                        "G3 - Population by geozone, nationality and sex"];        
        
//        mapTypes.sort();
//        console.log(mapTypes);
//        
//        // select all the options (that don't exist yet)
//        dropdown.selectAll('option')
//          .data(mapTypes).enter() // attach our array as data
//          .append("option") // append a new option element for each data item
//          .text(function (d) {
//            return d // use the item as text
//          })
//          .attr("value", function (d) {
//            return d // use the time as value attribute
//          })
  
  //=============
  
  L.control.layers({
      'G1': omnivore.csv('data/G1_Census2011.csv'),
      'G2': omnivore.csv('data/G2_Census2011.csv'),
      'G3': omnivore.csv('data/G3_Census2011.csv')
    }, {
      'Mapbox Light': omnivore.geojson('data/geozones_G8.geojson')
  }).addTo(map);

  function drawMap(data) {
    var options = {
      pointToLayer: function (feature, ll) {
        return L.circleMarker(ll, {
            opacity: 1,
            weight: 2,
            fillOpacity: 0,
        })
      }    
    }
    console.log(data);
    // create 2 separate layers from GeoJSON data
    var femaleLayer = L.geoJson(data, options).addTo(map),
        maleLayer = L.geoJson(data, options).addTo(map);
    // fit the bounds of the map to one of the layers
    map.fitBounds(femaleLayer.getBounds());
    // adjust zoom level of map
    map.setZoom(map.getZoom() - .4);
    
    femaleLayer.setStyle({color: '#f4f731', });
    maleLayer.setStyle({color: '#0655d3', });
    
    resizeCircles(femaleLayer, maleLayer, 1);
    
    sequenceUI(femaleLayer, maleLayer);
    
    
    
  } // end drawMap()
  
  function calcRadius(val) {
    var radius = Math.sqrt(val / Math.PI);
    return radius * 1.5; // adjust .5 as a scale factor
  }

  function resizeCircles(femaleLayer, maleLayer, curentCategorie) {
    femaleLayer.eachLayer(function (layer) {
      var radius = calcRadius(Number(layer.feature.properties['F' + curentCategorie]));
      layer.setRadius(radius);
    });
    maleLayer.eachLayer(function (layer) {
      var radius = calcRadius(Number(layer.feature.properties['M' + curentCategorie]));
      layer.setRadius(radius);      
    })
    // update the hover window with current categorie's
    retrieveInfo(maleLayer, curentCategorie);
  }
  
  function sequenceUI(femaleLayer, maleLayer) {
    // create Leaflet control for the slider
    var sliderControl = L.control({
      position: 'bottomleft'
    });
    sliderControl.onAdd = function (map) {
      var controls = L.DomUtil.get("slider");
      L.DomEvent.disableScrollPropagation(controls);
      L.DomEvent.disableClickPropagation(controls);
      return controls;
    }
    //select the slider's input and listen for change
    $('#slider input[type=range]')
    .on('input', function () {
      // current value of slider is current categorie level
      var curentCategorie = this.value;
      // resize the circles with updated categorie level
      resizeCircles(femaleLayer, maleLayer, curentCategorie);
      $(".categorie span:first-child").html(curentCategorie);
    });
    sliderControl.addTo(map);  
  }
  
  function drawLegend(data) {    
    // create Leaflet control for the legend
    var legendControl = L.control({
      position: 'bottomright'
    });
    // when the control is added to the map
    legendControl.onAdd = function (map) {
      // select the legend using id attribute of legend
      var legend = L.DomUtil.get("legend");
      // disable scroll and click functionality 
      L.DomEvent.disableScrollPropagation(legend);
      L.DomEvent.disableClickPropagation(legend);
      // return the selection
      return legend;
    }
    legendControl.addTo(map);    
  
    // loop through all features (i.e., the schools)
    var dataValues = data.features.map(function (school) {
      // for each categorie in a school
      for (var categorie in school.properties) {
        // shorthand to each value
        var value = school.properties[categorie];
        // if the value can be converted to a number 
        if (+value) {
          //return the value to the array
          return +value;
        }
      }
    });
    // verify your results!
    //console.log(dataValues);
    
    // sort our array
    var sortedValues = dataValues.sort(function(a, b) {
        return b - a;
    });
    // round the highest number and use as our large circle diameter
    var maxValue = Math.round(sortedValues[0] / 1000) * 1000;
  
    // calc the diameters
    var largeDiameter = calcRadius(maxValue) * 2,
        smallDiameter = largeDiameter / 2;

    // select our circles container and set the height
    $(".legend-circles").css('height', largeDiameter.toFixed());

    // set width and height for large circle
    $('.legend-large').css({
        'width': largeDiameter.toFixed(),
        'height': largeDiameter.toFixed()
    });
    // set width and height for small circle and position
    $('.legend-small').css({
        'width': smallDiameter.toFixed(),
        'height': smallDiameter.toFixed(),
        'top': largeDiameter - smallDiameter,
        'left': smallDiameter / 2
    })

    // label the max and median value
    $(".legend-large-label").html(maxValue.toLocaleString());
    $(".legend-small-label").html((maxValue / 2).toLocaleString());

    // adjust the position of the large based on size of circle
    $(".legend-large-label").css({
        'top': -11,
        'left': largeDiameter + 30,
    });

    // adjust the position of the large based on size of circle
    $(".legend-small-label").css({
        'top': smallDiameter - 11,
        'left': largeDiameter + 30
    });

    // insert a couple hr elements and use to connect value label to top of each circle
    $("<hr class='large'>").insertBefore(".legend-large-label")
    $("<hr class='small'>").insertBefore(".legend-small-label").css('top', largeDiameter - smallDiameter - 8); 
  }
  
  function retrieveInfo(maleLayer, curentCategorie) {
    // select the element and reference with variable
    // and hide it from view initially
    var info = $('#info').hide();

    // since maleLayer is on top, use to detect mouseover events
    maleLayer.on('mouseover', function (e) {
      // remove the none class to display and show
      info.show();
      // access properties of target layer
      var props = e.layer.feature.properties;
      console.log(props);
      // populate HTML elements with relevant info
      $('#info span').html(props.Geozone);
      $(".female span:first-child").html('(categorie ' + curentCategorie + ')');
      $(".male span:first-child").html('(categorie ' + curentCategorie + ')');
      $(".female span:last-child").html(Number(props['F' + curentCategorie]).toLocaleString());
      $(".male span:last-child").html(Number(props['M' + curentCategorie]).toLocaleString());
      
      //$(".categorie span:first-child").html(curentCategorie);

      console.log(props.Geozone);
      console.log(curentCategorie);
      console.log(Number(props['M' + curentCategorie]).toLocaleString())
      
      // raise opacity level as visual affordance
      e.layer.setStyle({
        fillOpacity: .6
      });

      // empty arrays for male and female values
      var femaleValues = [],
          maleValues = [];

      // loop through the categorie levels and push values into those arrays
      for (var i = 1; i <= 4; i++) {
        femaleValues.push(props['F' + i]);
        maleValues.push(props['M' + i]);
      } 
            
      $('.femalepark').sparkline(femaleValues, {
          width: '200px',
          height: '30px',
          lineColor: '#f4f731',
          fillColor: '#fbfcbd',
          spotRadius: 0,
          lineWidth: 2
      });
      $('.malepark').sparkline(maleValues, {
          width: '200px',
          height: '30px',
          lineColor: '#0655d3',
          fillColor: '#9e9bf7',
          spotRadius: 0,
          lineWidth: 2
      });      
    }); 
    
    // hide the info panel when mousing off layergroup and remove affordance opacity
    maleLayer.on('mouseout', function(e) {
        // hide the info panel
        info.hide();
        // reset the layer style
        e.layer.setStyle({
            fillOpacity: 0
        });
    });
    // when the mouse moves on the document
    $(document).mousemove(function(e) {
        // first offset from the mouse position of the info window
        info.css({
            "left": e.pageX + 6,
            "top": e.pageY - info.height() - 25
        });
        // if it crashes into the top, flip it lower right
        if (info.offset().top < 4) {
            info.css({
                "top": e.pageY + 15
            });
        }
        // if it crashes into the right, flip it to the left
        if (info.offset().left + info.width() >= $(document).width() - 40) {
            info.css({
                "left": e.pageX - info.width() - 80
            });
        }
    });
  }
    
  function addFilter(mapTypes1) {
      // select the map element
      var dropdown = d3.select('#map')
        .append('select')  // append a new select element
        .attr('class', 'filter')  // add a class name
        //.on('change', onchange)  // listen for change
      
      // select all the options (that don't exist yet)
      dropdown.selectAll('option')
        .data(mapTypes).enter() // attach our array as data
        .append("option") // append a new option element for each data item
        .text(function (d) {
          return d // use the item as text
        })
        .attr("value", function (d) {
          return d // use the time as value attribute
        });      
      //onchange()
       
//      function onchange() {
//        // get the current value from the select element
//        var val = d3.select('select').property('value')
//        // style the display of the facilities
//        mapTypes.style("display", function (d) {
//          // if it's our default, show them all with inline
//          if (val === "G1") return "inline"
//          // otherwise, if each industry type doesn't match the value 
//          if (d.mapTypes != val) return "none"  // don't display it
//        })
//      }
    }  

  
  
  
})();