var saveData = (function () {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function (data, fileName) {
        var json = JSON.stringify(data),
            blob = new Blob([json], {type: "octet/stream"}),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());

function highlightCart(username)
{
	if( localStorage.getItem("MKMPreviewCart") !== null )
	{
		var arrayUID = JSON.parse( localStorage.getItem("MKMPreviewCart") );
		if(arrayUID[username] === undefined) return;
		
		Lines.forEach( (L) => {
			var cardName = L.querySelector(".col-seller").innerText;
			if(arrayUID[username][cardName] !== undefined) L.style.backgroundColor='yellow';
		} )
	}
}

function sendToCart(username,cardValue)
{
	var cardName = cardValue.split(':')[0];
	var cardPrice = cardValue.split(':')[1];
	
	var arrayUID;
	if( localStorage.getItem("MKMPreviewCart") !== null ) arrayUID = JSON.parse( localStorage.getItem("MKMPreviewCart") );
	else arrayUID = {};
	
	if(arrayUID[username] === undefined) arrayUID[username] = {};
	arrayUID[username][cardName] = cardPrice;
	localStorage.setItem( "MKMPreviewCart", JSON.stringify(arrayUID) );	
}

function openPricePopUp(link) {
    closePricePopUp();
    var myFloatingDiv = document.createElement("div");
    myFloatingDiv.setAttribute("ID", "KDODIV");
    myFloatingDiv.setAttribute("style", "right: 0px; border: 0px none; height: 370px; position: fixed; width: 270px; overflow: hidden; bottom: -67px;");
    var myIFrame = document.createElement("iframe");
    myIFrame.setAttribute('src', link + '#tabContent-info');
    myIFrame.setAttribute('scrolling', 'yes');
    myIFrame.setAttribute('style', 'height: 300px; border: 0px none;  width: 1650px; margin-bottom: 0px; margin-left: 24px; ');
    myFloatingDiv.appendChild(myIFrame);
    document.body.appendChild(myFloatingDiv);
}

function closePricePopUp() {
    myPreviousFloatingDiv = document.querySelector("#KDODIV");
    if (myPreviousFloatingDiv)
        myPreviousFloatingDiv.remove();
}

function fetchAll() {
    cardUrls = document.querySelectorAll(".table-body > div > .col-thumbnail");
    var i = 0;
    for (i = 0;
        i < cardUrls.length;
        i++) {
        fetchCardPrices(i + 1);
    }
}

function fetchCardPrices(num) {
    var cardLine = document.querySelector(".table-body > div:nth-child(" + num + ")");
    var cardURL = cardLine.querySelector(".col-seller > a").innerText;
    var sellerPrice = cardLine.querySelector(".price-container > div > div > span").innerText;
    sellerPrice = sellerPrice.substring(0 , sellerPrice.length - 2).replace(',' , '.');
    var splat = cardURL.split('/');
    var cardName = cardURL;
    cardName = cardName.replace(/ \(.*\)/g, '');
    cardName = cardName.replace(/ \/ /g, ' ');
    cardName = cardName.replace(/,/g, '');
    cardName = cardName.replace(/'/g, '');
    cardName = cardName.replace(/ /g, '-');
	
	var dispo;
	if( typeof(kdoCardList) == 'undefined' ){
		dispo = ' ? ';
	}
	else{
		if( kdoCardList.includes(cardURL) ) dispo = ' X ';
		else dispo = ' + ';
	}
	
    var cardCommentElem = cardLine.querySelector(".item-count");
    if (cardCommentElem.innerText.includes('|') || cardCommentElem.innerText.includes('...'))
        return;
    cardCommentElem.innerText = "... fetching ...";
    fetch("https://www.cardmarket.com/en/Magic/Cards/" + cardName).then(function (response) {
        return response.text();
    }).then(function (html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, "text/html");
        var fromPrice = doc.querySelector("#info > div > dl > dd:nth-child(6)").innerText;
        var trendPrice = doc.querySelector("#info > div > dl > dd:nth-child(8)").innerText;
        var trendPrice2 = trendPrice.substring(0 , trendPrice.length - 2).replace(',' , '.');
        var additionnalInfo = "";
		console.log(sellerPrice);
		console.log(trendPrice2);
        if (parseFloat(sellerPrice) <= parseFloat(trendPrice2))
            additionnalInfo = " ![" + (parseFloat(trendPrice2) - parseFloat(sellerPrice)).toFixed(2) + "] ";
        cardCommentElem.innerText = "_" + dispo + fromPrice + " | " + trendPrice + additionnalInfo;
    }).catch(function (err) {
        console.log('Failed to fetch page: ' + err);
        cardCommentElem.innerText = "---";
    });
}

var previousButton = document.querySelector("#MKMFetchButton");
if (previousButton)
    previousButton.remove();
var filterDiv = document.querySelector(".w-100");
var fetchButton = document.createElement("input");
fetchButton.setAttribute('type', 'button');
fetchButton.setAttribute('value', 'fetch all');
fetchButton.setAttribute('id', 'MKMFetchButton');
fetchButton.onclick = function () {
    fetchAll()
};
filterDiv.appendChild(fetchButton);
var saveButton = document.createElement("input");
saveButton.setAttribute('type', 'button');
saveButton.setAttribute('value', 'Preview Cart');
saveButton.setAttribute('id', 'MKMSaveButton');
saveButton.onclick = function () {
    if( localStorage.getItem("MKMPreviewCart") !== null )
	{
		var arrayUID = JSON.parse( localStorage.getItem("MKMPreviewCart") );
		saveData(arrayUID, 'MKMPreviewCart.json');
	}
};
filterDiv.appendChild(saveButton);
var cardImgs = document.querySelectorAll(".table-body > div > .col-offer > .price-container");
var i = 0;
for (i = 0;
    i < cardImgs.length;
    i++) {
    cardImgs[i].setAttribute("id", i + 1);
    cardImgs[i].onmouseover = function () {
        fetchCardPrices(this.id)
    };
}
var cardUrls = document.querySelectorAll(".table-body > div > .col-sellerProductInfo > div > .col-seller > a ");
var i = 0;
for (i = 0;
    i < cardUrls.length;
    i++) {
    var currentUrl = cardUrls[i].getAttribute("href");
    cardUrls[i].onmouseover = function () {
        openPricePopUp(this.href)
    };
}


var userName = document.querySelector("h1").innerText.split('\n')[0];
var Lines = document.querySelectorAll(".table-body > div");
highlightCart(userName);

Lines.forEach( (L) => {
	
	var cardURL = L.querySelector(".col-seller > a").innerText;
	var cardName = L.querySelector(".col-seller").innerText;
	var sellerPrice = L.querySelector(".price-container > div > div > span").innerText;
	sellerPrice = sellerPrice.substring(0 , sellerPrice.length - 2).replace(',' , '.');

	L.querySelectorAll('div.col-offer > div.actions-container > div.input-group').forEach( (e) => {			
		var btn = document.createElement("button");
		btn.onclick = function () {
			sendToCart(userName, this.value);
			highlightCart(userName);
		};
		var textnode = document.createTextNode("+");
		btn.appendChild(textnode); 
		btn.setAttribute('class','btn btn-primary btn-sm rounded');
		btn.setAttribute('type','button');
		btn.setAttribute('value',cardName+':'+sellerPrice);
		e.appendChild(btn);
	} )
} );