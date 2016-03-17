function get_time_diff( datetime )
{
    var datetime = typeof datetime !== 'undefined' ? datetime : "2014-01-01 01:02:03.123456";

    // console.log( datetime);

    var datetime = new Date( datetime ) //.getTime();
    // var now = new Date().getTime();

    // console.log("cur time " +  datetime);

    var now = new Date(); 
    var now_utc = now;
    // var now_utc = now.getTime() + now.getTimezoneOffset() * 60000
    // new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());


    if( isNaN(datetime) )
    {
        return "";
    }

    // console.log( datetime + " " + now + " " + now_utc);

    if (datetime < now_utc) {
        var milisec_diff = now_utc - datetime;
    } else {
        var milisec_diff = datetime - now_utc;
    }

    var days = Math.floor(milisec_diff / 1000 / 60 / (60 * 24));

    var date_diff = new Date( milisec_diff );

    return [days, date_diff.getUTCHours(), date_diff.getUTCMinutes()];
}



var make_label12 = function (label, value, unit, context) {
      return React.createElement(
        "div",
        { "className": "col-lg-12 col-md-12" },
        React.createElement(
          "div",
          { "className": "panel panel-" + context },
          React.createElement(
            "div",
            { "className": "panel-heading" },
            React.createElement(
              "div",
              { "className": "row" },
              React.createElement(
                "div",
                { "className": "col-lg-6 col-md-12 text-left" },
                React.createElement(
                  "div",
                  { "className": "huge" },
                    label
                )
              ),
              React.createElement(
                "div",
                { "className": "col-lg-6 col-md-12 text-right" },
                React.createElement(
                  "div",
                  { "className": "huge" },
                    value + " " + unit
                )
              )
            )
          )
        )
      );
};


var make_label = function (label, value, unit, context) {
      return React.createElement(
        "div",
        { "className": "col-lg-6 col-md-12" },
        React.createElement(
          "div",
          { "className": "panel panel-" + context },
          React.createElement(
            "div",
            { "className": "panel-heading" },
            React.createElement(
              "div",
              { "className": "row" },
              React.createElement(
                "div",
                { "className": "col-lg-6 col-md-12 text-left" },
                React.createElement(
                  "div",
                  { "className": "huge" },
                    label
                )
              ),
              React.createElement(
                "div",
                { "className": "col-lg-6 col-md-12 text-right" },
                React.createElement(
                  "div",
                  { "className": "huge" },
                    value + " " + unit
                )
              )
            )
          ),
          React.createElement(
            "a",
            { href: "#" },
            React.createElement(
              "div",
              { "className": "panel-footer" },
              React.createElement("span", { "className": "pull-left" }),
              React.createElement("span", { "className": "pull-right" }),
              React.createElement("div", { "className": "clearfix" })
            )
          )
        )
      );
};



var DatetimeLabel = React.createClass({
  displayName: "DatetimeLabel",

  render: function() {
    var _this = this;

      var dt = this.props.value;
      var msg = "";

      // console.log("123" + dt)
      day_hour_min = get_time_diff( dt );

      // console.log(day_hour_min)

      context = "danger"

      if (day_hour_min[0] > 0) {
	  msg = "Last update older than " + day_hour_min[0] + " days";
      } else if (day_hour_min[1] > 0) {
	  msg = "Last update older than " + day_hour_min[1] + " hours";
      } else if (day_hour_min[2] > 2) {
	  msg = "Last update older than " + day_hour_min[2] + " minutes";
      } else {
	  msg = "Last update within a minute.";
	  context = "warning"
      };


    return make_label12(msg, this.props.label, "", context);
  }
});

function zeropad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}

var CurrenttimeLabel = React.createClass({
  displayName: "CurrentimeLabel",

  render: function() {
      var _this = this;

      var now = new Date(); 

      var fmt = "YEAR-MONTH-DAY HOUR:MINUTE:SECONDS"
      msg= fmt.replace("YEAR", now.getUTCFullYear())
	  .replace("MONTH", zeropad(now.getUTCMonth()+1, 2))
	  .replace("DAY", zeropad(now.getUTCDate(), 2))
	  .replace("HOUR", zeropad(now.getUTCHours(), 2))
	  .replace("MINUTE", zeropad(now.getUTCMinutes(), 2))
	  .replace("SECONDS", zeropad(now.getUTCSeconds(), 2))
      return make_label12("Current Time", msg, "", "info");
  }
});


var SimpleLabel = React.createClass({
  displayName: "SimpleLabel",

  render: function() {
    var _this = this;
    return make_label12(this.props.label, this.props.value, "", "warning");
  }
});

var PressureLabel = React.createClass({
  displayName: "TempLabel",

  render: function() {
    var _this = this;
    return make_label(this.props.label, this.props.value, "Torr", "sucess");
  }
});

var TempLabel = React.createClass({
  displayName: "TempLabel",

  render: function() {
    var _this = this;
    return make_label(this.props.label, this.props.value.toFixed(1), "K", "primary");
  }
});

var PercentLabel = React.createClass({
  displayName: "percentLabel",

  render: function() {
    var _this = this;
    return make_label(this.props.label, this.props.value.toFixed(2), "%", "primary");
  }
});


var HKApp = React.createClass({
  displayName: 'HKApp',

  mixins: [ReactFireMixin],

  getInitialState: function () {
    return {
	items: [],
	current_time : null
    };
  },

  componentWillMount: function () {
    console.log("mount event");
    var firebaseRef = new Firebase('https://igrins-hk.firebaseio.com/BasicHK');
    this.bindAsArray(firebaseRef.orderByChild('utc_upload').limitToLast(1), 'items');
  },

  componentDidMount: function(){

        // componentDidMount is called by react when the component 
        // has been rendered on the page. We can set the interval here:

      this.timer = setInterval(this.tick, 200);
  },

  componentWillUnmount: function(){

        // This method is called immediately before the component is removed
        // from the page and destroyed. We can clear the interval here:

        clearInterval(this.timer);
  },

  tick: function(){

        // This function is called every 50 ms. It updates the 
        // elapsed counter. Calling setState causes the component to be re-rendered

        this.setState({current_time: new Date()});
  },



  onChange: function (e) {
    console.log("on-change event");
  },

  render: function () {
      if (this.state.items.length > 0) {
	  // console.log("render " + this.props.label);
	  return React.createElement("div",
				     {"className": "container-fluid"},
				     React.createElement("div",
							 {"className": "row"},
							 React.createElement(CurrenttimeLabel, 
									     {label: "Current time :"
									     })
							),
				     React.createElement("div",
							 {"className": "row"},
							 React.createElement(DatetimeLabel, 
									     {label: this.state.items[0]["date"] + " " + this.state.items[0]["time"],
									      value: this.state.items[0]["datetime"] })
							),
				     React.createElement("div",
							 {"className": "row"},
							 React.createElement(PressureLabel, 
									     { label: "Pressure",
									       value: this.state.items[0]["pressure"] })
							),
				     React.createElement("div",
							 {"className": "row"},
							 React.createElement(TempLabel, 
									     { label: "Bench",
									       value: this.state.items[0]["bench"] }),
							 React.createElement(PercentLabel, 
									     { label: "BenchTC",
									       value: this.state.items[0]["bench_tc"] })
							),
				     React.createElement("div",
							 {"className": "row"},
							 React.createElement(TempLabel, 
									     { label: "ColdHead#1",
									       value: this.state.items[0]["coldhead01"] }),
							 React.createElement(TempLabel, 
									     { label: "CharcoalBox#2",
									       value: this.state.items[0]["chacoalbox"] })
							),
				     React.createElement("div",
							 {"className": "row"},
							 React.createElement(TempLabel, 
									     { label: "Det H",
									       value: this.state.items[0]["detH"] }),
							 React.createElement(PercentLabel, 
									     { label: "Det H - TC",
									       value: this.state.items[0]["detH_tc"] })
							),
				     React.createElement("div",
							 {"className": "row"},
							 React.createElement(TempLabel, 
									     { label: "Det K",
									       value: this.state.items[0]["detK"] }),
							 React.createElement(PercentLabel, 
									     { label: "Det K - TC",
									       value: this.state.items[0]["detK_tc"] })
							),
				     React.createElement("div",
							 {"className": "row"},
							 React.createElement(TempLabel, 
									     { label: "Det SVC",
									       value: this.state.items[0]["detS"] }),
							 React.createElement(PercentLabel, 
									     { label: "Det SVC - TC",
									       value: this.state.items[0]["detS_tc"] })
							),
				     React.createElement("div",
							 {"className": "row"},
							 React.createElement(TempLabel, 
									     { label: "Grating",
									       value: this.state.items[0]["grating"] }),
							 React.createElement(PercentLabel, 
									     { label: "Grating - TC",
									       value: this.state.items[0]["grating_tc"] })
							),
				     React.createElement("div",
							 {"className": "row"},
							 React.createElement(TempLabel, 
									     { label: "ColdHead#2",
									       value: this.state.items[0]["coldhead02"] })
							)
				    );
      } else {
	  return React.createElement("div",
				     {"className": "container-fluid"},
				     React.createElement("div",
							 {"className": "row"},
							 React.createElement(CurrenttimeLabel, 
									     {label: "Current time :"
									     })
							),
				     React.createElement("div",
							 {"className": "row"},
							 React.createElement(SimpleLabel, 
									     {label: "Waiting for DB connection",
									      value: ""})
							)
	  );
      }
  }
});

ReactDOM.render(React.createElement(HKApp, null), 
		document.getElementById('HKApp'));



