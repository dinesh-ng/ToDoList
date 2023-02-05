// module.exports is same as exports

exports.getDate = function () {
  var today = new Date();
  var options = {
    weekday: "long",
    month: "long",
    day: "numeric",
  };
  let day = today.toLocaleDateString("en-US", options);
  return day;
};

exports.getDay = function () {
  var today = new Date();
  var options = {
    weekday: "long",
  };
  let day = today.toLocaleDateString("en-US", options);
  return day;
};
