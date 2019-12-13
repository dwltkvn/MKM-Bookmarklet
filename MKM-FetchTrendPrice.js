function openPricePopUp(link)
{
    closePricePopUp();
    var myFloatingDiv = document.createElement("div");
    myFloatingDiv.setAttribute("ID","KDODIV");
    myFloatingDiv.setAttribute("style","right: 0px; border: 0px none; height: 370px; position: fixed; width: 270px; overflow: hidden; bottom: -67px;");

    var myIFrame = document.createElement("iframe");
    myIFrame.setAttribute('src',link+'#tabContent-info');
    myIFrame.setAttribute('scrolling','yes');
    myIFrame.setAttribute('style','height: 300px; border: 0px none; width: 1650px; margin-bottom: 0px; margin-left: 24px;');

    myFloatingDiv.appendChild(myIFrame);
    document.body.appendChild(myFloatingDiv);
}

function closePricePopUp()
{
    myPreviousFloatingDiv = document.querySelector("#KDODIV");
    if(myPreviousFloatingDiv) myPreviousFloatingDiv.remove();
}

function fetchAll()
{
    cardUrls = document.querySelectorAll(".table-body > div > .col-thumbnail");
    var i = 0;
    for (i = 0; i < cardUrls.length; i++) {
        fetchCardPrices(i+1);
    }
}

function fetchCardPrices(num)
{
    var cardLine = document.querySelector(".table-body > div:nth-child("+num+")");
    var cardURL = cardLine.querySelector(".col-seller > a").getAttribute("href");
    var sellerPrice = cardLine.querySelector(".price-container > div > div > span").innerText;
    sellerPrice = sellerPrice.substring( 0, sellerPrice.length -2 ).replace(',','.');
    var splat = cardURL.split('/');
    var cardName = splat[ splat.length-1 ].replace('-s','s');

    var cardCommentElem  = cardLine.querySelector(".product-comments > div > span");
    if(cardCommentElem.innerText.includes('|')) return;
    cardCommentElem.innerText = "... fetching ...";

    fetch("https://www.cardmarket.com/en/Magic/Cards/"+cardName)
                .then(function(response) { return response.text(); })
                .then(function(html) {
                        
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, "text/html");

        var fromPrice = doc.querySelector("#info > div > dl > dd:nth-child(6)").innerText;
        var trendPrice = doc.querySelector("#info > div > dl > dd:nth-child(8)").innerText;
        var trendPrice2 = trendPrice.substring( 0, trendPrice.length -2 ).replace(',','.');

        var additionnalInfo = "";
        if( parseFloat(sellerPrice) <= parseFloat(trendPrice2) ) additionnalInfo = " ![ "+ (parseFloat(trendPrice2)-parseFloat(sellerPrice)).toFixed(2) +" ] ";

        cardCommentElem.innerText = fromPrice + " | " + trendPrice + additionnalInfo;
    })
    .catch(function(err) {
        console.log('Failed to fetch page: ', err); 
        cardCommentElem.innerText = "---";
    });
}

var previousButton = document.querySelector("#MKMFetchButton");
if(previousButton) previousButton.remove();

var filterDiv = document.querySelector(".w-100");
var fetchButton = document.createElement("input");
fetchButton.setAttribute('type','button');
fetchButton.setAttribute('value','fetch all');
fetchButton.setAttribute('id','MKMFetchButton');
fetchButton.onclick = function(){ fetchAll() };
filterDiv.appendChild(fetchButton);

var cardImgs = document.querySelectorAll(".table-body > div > .col-thumbnail");
var i = 0;
for (i = 0; i < cardImgs.length; i++) {
    cardImgs[i].setAttribute("id",i+1);
    cardImgs[i].onmouseover = function() { fetchCardPrices(this.id) };
}

var cardUrls = document.querySelectorAll("table.fullWidth > tbody > tr > td > div > div > a");
var i = 0;
for (i = 0; i < cardUrls.length; i++) {
    var currentUrl = cardUrls[i].getAttribute("href");
    cardUrls[i].onmouseover = function() { openPricePopUp(this.href) };
}