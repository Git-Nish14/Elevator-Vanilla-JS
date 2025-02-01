var buttons = document.querySelectorAll(".btn");
var elevators = document.querySelectorAll(".svgwraper");

var queueFloors = [];
var allLiftStatus = [];

for (var i = 0; i < 5; i++) {
  allLiftStatus.push({
    liftIndex: i,
    moving: false,
    floor: 0
  });
}

window.onload = function () {
  for (var i = 0; i < elevators.length; i++) {
    elevators[i].style.transform = "translateY(0%)";
    allLiftStatus[i].floor = 0;
  }
};

function findNearestLift(currentFloor) {
  var closest = { distance: Infinity, lift: null };
  
  for (var i = 0; i < allLiftStatus.length; i++) {
    var lift = allLiftStatus[i];
    if (!lift.moving) {
      var distance = Math.abs(currentFloor - lift.floor);
      if (distance < closest.distance) {
        closest.distance = distance;
        closest.lift = lift;
      }
    }
  }
  return closest;
}

function isLiftAlreadyThere(calledFloor) {
  for (var i = 0; i < allLiftStatus.length; i++) {
    if (allLiftStatus[i].floor === calledFloor) {
      return true;
    }
  }
  return false;
}

function areAllLiftsBusy() {
  for (var i = 0; i < allLiftStatus.length; i++) {
    if (!allLiftStatus[i].moving) {
      return false;
    }
  }
  return true;
}

function updateButtonUI(button, text, bgColor, disabled) {
  button.textContent = text;
  button.style.backgroundColor = bgColor;
  button.disabled = disabled || true;
}

function updateElevatorUI(elevator, color) {
  var paths = elevator.querySelectorAll("path");
  for (var i = 0; i < paths.length; i++) {
    paths[i].setAttribute("fill", color);
  }
}

function playSound() {
  var audio = new Audio("./sound/Beep.mp3");
  audio.play();
}

for (var i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener("click", function () {
    var clickedFloor = parseInt(this.id.split("-")[1]);

    if (areAllLiftsBusy()) {
      queueFloors.push(clickedFloor);
      return;
    }

    if (!isLiftAlreadyThere(clickedFloor)) {
      updateButtonUI(this, "Waiting", "red");
      handleLiftRequest(clickedFloor, this);
    }
  });
}

function handleLiftRequest(clickedFloor, button) {
  var result = findNearestLift(clickedFloor);
  if (!result.lift) return;
  moveElevator(result.lift, clickedFloor, button);
}

function moveElevator(lift, targetFloor, button) {
  var elevator = elevators[lift.liftIndex];
  var travelTime = Math.abs(targetFloor - lift.floor) * 0.5;

  lift.moving = true;
  lift.floor = targetFloor;

  playSound();
  updateElevatorUI(elevator, "red");
  
  button.textContent = "Waiting (" + travelTime.toFixed(1) + "s)";

  elevator.style.transition = "transform " + travelTime + "s linear";
  elevator.style.transform = "translateY(-" + (targetFloor * 130) + "%)";

  setTimeout(function () {
    updateElevatorUI(elevator, "green");
    updateButtonUI(button, "Arrived", "black", false);
    setTimeout(function () {
      resetElevator(lift, elevator, button);
    }, 2000);
  }, travelTime * 1000);
}

function resetElevator(lift, elevator, button) {
  lift.moving = false;
  updateElevatorUI(elevator, "black");
  updateButtonUI(button, "Call", "rgb(2, 97, 0)", false);

  if (queueFloors.length > 0) {
    var nextFloor = queueFloors.shift();
    var nextButton = document.getElementById("btn-" + nextFloor);
    handleLiftRequest(nextFloor, nextButton);
  }
}
