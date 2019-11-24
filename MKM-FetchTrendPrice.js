function fetchCardPrices(num)
{
    var cardLine = document.querySelector("#bupPaginator\\.innerNavBarCodeDiv > table > tbody > tr:nth-child("+num+")");
    var cardURL = cardLine.querySelector("td:nth-child(2) > div > div > a").getAttribute("href");
    var sellerPrice = cardLine.querySelector("td.st_price").innerText;
    sellerPrice = sellerPrice.substring( 0, sellerPrice.length -2 ).replace(',','.');

    var splat = cardURL.split('/');
    var cardName = splat[ splat.length-1 ].replace('-s','s');

    var cardCommentElem = cardLine.querySelector("td:nth-child(8) > div");

    fetch("https://www.cardmarket.com/en/Magic/Cards/"+cardName)
                .then(function(response) { return response.text(); })
                .then(function(html) {
                        
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, "text/html");

        var fromPrice = doc.querySelector("#info > div > dl > dd:nth-child(6)").innerText;
        var trendPrice = doc.querySelector("#info > div > dl > dd:nth-child(8)").innerText;
        var trendPrice2 = trendPrice.substring( 0, sellerPrice.length -2 ).replace(',','.');

        var additionnalInfo = "";
        if( parseFloat(sellerPrice) <= parseFloat(trendPrice2) ) additionnalInfo = " [!!!] ";

        cardCommentElem.innerText = fromPrice + " | " + trendPrice + additionnalInfo;
    })
    .catch(function(err) {
        console.log('Failed to fetch page: ', err); 
        cardCommentElem.innerText = "---";
    });
}

cardUrls = document.querySelectorAll("table.fullWidth > tbody > tr > td > div > div > a");
var i = 1;
for (i = 1; i <= cardUrls.length; i++) {
    fetchCardPrices(i);
}