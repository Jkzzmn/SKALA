function bag() {
    var myBag = {
        "여권 ✈️": 1,
        "양치도구 🪥": 1,
        "핸드폰 📱": 1
    };
    var totalTypes = Object.keys(myBag).length;

    var message = "🎒 내 가방 속 물품 목록\n"
                + "**********************\n";
    for (var item in myBag) {
        message += "- " + item + " : " + myBag[item] + "개\n";
    }
    message += "**********************\n"
            + "총 물품 종류 : " + totalTypes + "가지";
    alert(message);
}