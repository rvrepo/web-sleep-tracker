(function () {
  //   checkAPISupport();
  let isTrackingOn = false;
  let acceleration;
  let startTime;
  let endTime;
  let movementStart = false;
  let disturbedFor = 0;
  let startTracking = 0,
    stopTracking = 0;

  // The wake lock sentinel.
  let wakeLock = null;

  window.addEventListener("devicemotion", function (event) {
    acceleration = event.acceleration;
    if (isTrackingOn) {
      if (
        acceleration.x !== 0 ||
        acceleration.y !== 0 ||
        acceleration.z !== 0
      ) {
        if (!movementStart) {
          stopTracking = Date.now();
          if (startTracking) {
            disturbedFor += stopTracking - startTracking;
          }
          startTracking = Date.now();
          movementStart = true;
        }
      } else {
        if (movementStart) {
          movementStart = false;
        }
      }
    }
  });

  $("#track").on("click", function () {
    let buttonText = isTrackingOn ? "Start" : "Stop";
    $(this).text(buttonText);
    isTrackingOn = !isTrackingOn;
    if (isTrackingOn) {
      startTime = Date.now();
      // Function that attempts to request a screen wake lock.
      const requestWakeLock = async () => {
        try {
          wakeLock = await navigator.wakeLock.request("screen");
          wakeLock.addEventListener("release", () => {
            console.log("Screen Wake Lock was released");
          });
          console.log("Screen Wake Lock is active");
        } catch (err) {
          console.error(`${err.name}, ${err.message}`);
        }
      };
      // Request a screen wake lock…
      requestWakeLock();
    } else {
      endTime = Date.now();
      $("#result").text(
        "Total sleep time is : " +
          new Date(endTime - startTime).toISOString().substr(11, 8) +
          "\n" +
          "Total disturbed time is : " +
          new Date(disturbedFor).toISOString().substr(11, 8)
      );
      disturbedFor = 0;
      startTracking = 0;
      stopTracking = 0;
      movementStart = false;
      wakeLock.release();
      wakeLock = null;
    }
  });
})();
