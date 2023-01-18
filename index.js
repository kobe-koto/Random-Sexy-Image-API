// noinspection JSCheckFunctionSignatures

const originatorHost = "https://file.koto.cc/api",
    originatorPath = "/?path=/Image/GetColorImg/",
    availableType = ["fur","gay","transfur"]

addEventListener("fetch", (event) => {
    const GlobalResponse404 = new Response("404 NOT FOUND, Please visit our docs: https://docs.koto.cc/apis/rsi .",
        {
            headers: HeadersInit,
            status: 404
        });

    return event.respondWith(
        handleRequest(event.request, GlobalResponse404).catch()
    );
});

async function handleRequest(request, GlobalResponse404) {
    let url = new URL(request.url);
    const databaseType = url.pathname.split("/")[1].toLowerCase();

    if (!availableType.includes(databaseType)) {
        return GlobalResponse404;
    }

    const { pics } = await fetch("https://ghs.koto.cc/static/database/" + databaseType + ".json")
        .then(response => response.json())
    const ImgList = pics;

    let ImgName = GenImgName(ImgList);

    const ResponseType = GetQueryString("type", url.search).toLowerCase()

    const ImgURL = originatorHost + "/raw" + originatorPath + databaseType + "/" + ImgName;

    if (ResponseType === "json") {
        const count = ImgList.length-1;

        let BasicData = {};
        BasicData.code = 200;
        BasicData.msg = "OK";
        BasicData.type = databaseType;
        BasicData.count = count;
        BasicData.name = ImgName;
        BasicData.url = ImgURL;
        BasicData.urlPreview= "https://drive.koto.cc/Main/Image/GetColorImg/"+databaseType+"/"+ImgName+"?preview" ;

        let returnData = BasicData;
        if (GetQueryString("fancy", url.search) === "true") {
            const fancyResponse = await fetch(originatorHost + originatorPath + databaseType + "/" + ImgName)
                .then(response => response.json())

            returnData = Object.assign(BasicData, fancyResponse.file);
        }

        const isSplit = GetQueryString("split", url.search);

        if (isSplit) {
            let SplitData = returnData[isSplit];
            return SplitData
                ? new Response(returnData[isSplit], {headers: HeadersInit})
                : GlobalResponse404;
        }
        HeadersInit['Content-Type'] = 'application/json;charset=UTF-8';

        return new Response(JSON.stringify(returnData), {headers: HeadersInit})
    } else if (ResponseType === "raw") {
        return Response.redirect(ImgURL, 307)
    } else if (ResponseType === "proxy") {
        let ProxyResponse = await fetch(ImgURL);

        HeadersInit["Content-Type"] = ProxyResponse.headers.get("Content-Type")

        return new Response(ProxyResponse.body, {headers: HeadersInit})
    } else {
        return new Response("400 Bad Request, Visit Docs: https://docs.koto.cc/apis/rsi .",
            {
                headers:HeadersInit,
                status:400
            });
    }

}


function GenImgName (ImgList) {
        let RandomImgName = ImgList[(
            Math.floor(
                ImgList.length * Math.random()
            )
        )];
        if (RandomImgName) {
            return RandomImgName;
        } else {
            return GenImgName(ImgList);
        }
}

function GetQueryString(name, search) {
    let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    let r = search.slice(1).match(reg);

    if (r !== null) {return r[2];} else {return undefined;}
}

const HeadersInit = {
    "Content-Type": "text/plain;charset=UTF-8",
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store'
}
