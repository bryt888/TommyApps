require(["dojo/_base/declare", "dojo/dom", "dojo/parser", "dojo/ready", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/form/Button", "dijit/form/HorizontalSlider", "dijit/form/HorizontalRule", "dijit/form/HorizontalRuleLabels","dojox/timing", "dojo/text!./templates/myWidget.html"], 
  function(declare, dom, parser, ready, _WidgetBase, _TemplatedMixin, Button, HorizontalSlider, HorizontalRule, HorizontalRuleLabels,dojoxtimer, template) {

  declare("FancyCounter", [_WidgetBase, _TemplatedMixin], {
    // counter
    _i : 0,
    rootObj:null,
    _radarUpdateTimer :null,
    _radarLoopingTimer:null,
    token:"",
    numLoopingFrames:13,
    loopFrames:null,
    currentL2RadarFrame:"",
    radarLoopingIndex:0,
    gSliderObj:null,
    mapObj:null,

    //use a html file as template
    templateString : template,
    
    postCreate : function() {
      rootObj = this;
      //update the radar tile info
      this._radarInfoUpdate();
      //this._autoCheckRadarFrames();
      //create the slider
      var slider = new HorizontalSlider({
        name : "slider",
        value : 1,
        minimum : 0,
        maximum : 12,
        intermediateChanges : true,
        discreteValues : 13,
        showButtons : false,
        style : "width:400px;",
        onChange : function(value) {
          //dom.byId("currentloopingframe").innerHTML = value;
        }
      }, "loopingslider");
      gSliderObj = slider;
      
      //create slider rule
      var sliderRule = new HorizontalRule({
        name : "sliderrule",
        count : 13,
        style : "height:5px;font-size:75%;color:gray;"
      }, "sliderrule");

      //create slider lable
      var sliderLabels = new HorizontalRuleLabels({
        name : "sliderlabel",
        container : "topDecoration",
        count : 13,
        labels : ["-60", "-55", "-50", "-45", "-40", "-35", "-30", "-25", "-20", "-15", "-10", "-05", "-00"],
        style : "height:2em;font-size:75%;color:gray;"
      }, "sliderlabel");

      //setup the radar looping timer
      _radarLoopingTimer = new dojox.timing.Timer(400);
      var thisObj = this;
      _radarLoopingTimer.onTick = function(){
        //radar looping ticking events
        thisObj._loopingRadarTicking();
      };
      _radarLoopingTimer.onStart = function(){
        
      };
    },
    //events after the start button is clicked
    startLooping : function() {
      //start to do the initial load of the layers
      
      
      
      //start to loop the radar frames after it's loaded
      _radarLoopingTimer.start();
      
      
      //console.log(this.loopFrames.length() );
    },
    //events after the stop button is clicked
    stopLooping : function() {
      //alert('stop');
      _radarLoopingTimer.stop();
      dijit.byId("loopingslider").attr('value',rootObj.numLoopingFrames-1);

    },
    
    //===============================================================================================================
    //deal with the events happen while radar is looping
    //===============================================================================================================
    _loopingRadarTicking: function() {
      //update the looping slide's value make it move
      dijit.byId("loopingslider").attr('value',rootObj.radarLoopingIndex);
      //update the display for current time frame
      var currentBaseIndex = rootObj.loopFrames.length - rootObj.numLoopingFrames;
      dom.byId("currentloopingframe").innerHTML = rootObj.loopFrames[currentBaseIndex + rootObj.radarLoopingIndex];

      rootObj.radarLoopingIndex++;
      //make sure the loop won't go beyond the number of frames
      if (rootObj.radarLoopingIndex>=rootObj.numLoopingFrames) {rootObj.radarLoopingIndex=0;}
    },
    
    
    _radarInfoUpdate:function() {
      //setup a timer to keep pulling the latest radar information
      _radarUpdateTimer = new dojox.timing.Timer(20000);
      var thisObj = this;
      _radarUpdateTimer.onTick = function(){
        thisObj._autoCheckRadarFrames();
      };
      _radarUpdateTimer.onStart = function(){
        thisObj._autoCheckRadarFrames();
      };
      _radarUpdateTimer.start();
      
    },
    
    _autoCheckRadarFrames: function () {
          console.log("update is called!");
          esri.config.defaults.io.proxyUrl = "/proxy/proxy.ashx";
          var dt = new Date();
          var layerInfo = esri.request({
              url: "http://gisserver.accuweather.com/ESRITileServices2/accuTileService/getRadarInfo?token=" + this.token + "&tt=" + dt.toString(),
              handleAs: "text"
          });
          layerInfo.then(this._layerInfoRequestSucceeded, this._layerInfoRequestFailed);
      },

      _layerInfoRequestSucceeded: function (response) {
          console.log("has response!");
          require(["dojo/json", "dojo/domReady!"], function (JSON) {
              var pos = response.indexOf('{');
              var strJ = response.substr(pos);
              l2RadarInfo = JSON.parse(strJ);
          });

          if (l2RadarInfo) {
              var frames = l2RadarInfo.frames;
              rootObj.loopFrames = l2RadarInfo.frames;
              console.log("Tiles are updated: " + rootObj.loopFrames );
              if (frames.length > 0) {
                  //get the latest frame
                  var cf = frames[frames.length - 1];
                  if (currentL2RadarFrame != cf) {
                      //update the radar

                      currentL2RadarFrame = cf;
                      console.log("Tiles are updated: " + l2RadarInfo.url + "/" + frames[frames.length - 1]);
                      //gObj.onTimeFrameUpdated(frames[frames.length - 1]);
                  }
              }

          }
      },

      _layerInfoRequestFailed: function (error) {
          console.log("error!" + error);
      }
    
  });

  ready(function() {
    // Call the parser manually so it runs after our widget is defined, and page has finished loading
    parser.parse();

  });

}); 