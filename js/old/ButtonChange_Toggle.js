/**
*
*/
var menuLeft = document.getElementById( 'cbp-spmenu-s1' );
var menuRight = document.getElementById( 'cbp-spmenu-s2' );
var menuTop = document.getElementById( 'cbp-spmenu-s3' );
var menuBottom = document.getElementById( 'cbp-spmenu-s4' );
var showLeft = document.getElementById( 'showLeft' );
var showBottom = document.getElementById( 'showBottom' );
var body = document.body;

showLeft.onclick = function() {
	classie.toggle( this, 'active' );
	classie.toggle( menuLeft, 'cbp-spmenu-open' );
	disableOther( 'showLeft' );
};
showBottom.onclick = function() {
	classie.toggle( this, 'active' );
	classie.toggle( menuBottom, 'cbp-spmenu-open' );
	disableOther( 'showBottom' );
};

/**
* Menu button
*/
var button = document.querySelectorAll("showLeft")[0];
showLeft.addEventListener('click', function() {
if (showLeft.getAttribute("data-text-swap") == showLeft.innerHTML) {
showLeft.innerHTML = showLeft.getAttribute("data-text-original");
} else {
showLeft.setAttribute("data-text-original", showLeft.innerHTML);
showLeft.innerHTML = showLeft.getAttribute("data-text-swap");
}
}, false);

/**
* INFO button
*/
var button = document.querySelectorAll("showBottom")[0];

showBottom.addEventListener('click', function() {
if (showBottom.getAttribute("data-text-swap") == showBottom.innerHTML) {
showBottom.innerHTML = showBottom.getAttribute("data-text-original");
} else {
showBottom.setAttribute("data-text-original", showBottom.innerHTML);
showBottom.innerHTML = showBottom.getAttribute("data-text-swap");
}
}, false);

