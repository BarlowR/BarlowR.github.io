var acc = document.getElementsByClassName("accordion");
var open = "    +";
var close = "     -"
console.log(acc);
for (var i = 0; i < acc.length; i++) {
  acc[i].innerHTML = acc[i].innerHTML + " " + open;
  acc[i].addEventListener("click", function() {
    console.log("clicked" + this.innerText);

    /* Toggle between hiding and showing the active panel */
    var subElement = this.nextElementSibling;

    if (!subElement){ return; }

    if (subElement.style.display === "block") {
        subElement.style.display = "none";
        this.innerHTML = this.innerHTML.slice(0,-1) + open;
    } else {
        subElement.style.display = "block";
        this.innerHTML = this.innerHTML.slice(0,-1) + close;
    }
  });
}
