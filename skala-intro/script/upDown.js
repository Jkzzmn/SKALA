
function updowngame(){
    var computerNum = Math.floor(Math.random() * 50) + 1;
    let count = 0;
    while(true){
        let userInput = prompt("1부터 50 사이의 숫자를 입력하세요!");
        if (userInput === null){
            break;
        }
        let userNum = Number(userInput);
        if (userNum > computerNum){
            alert('Down!');
            count += 1;
        }
        else if(userNum< computerNum){
            alert('Up!');
            count += 1;
        }
        else if(userNum === computerNum){
            count += 1
            alert("축하합니다 "+count+"번 만에 맞추셨습니다.")
            break;
        }
        else{
            alert("다시 입력해주세요.")
        }
    }
}

