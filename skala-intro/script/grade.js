function grade(){
    var subjects = ["HTML","CSS","JavaScript"];
    var total = 0;
    for (let i=0; i<subjects.length; i++){
        let userInput = prompt(subjects[i]+" 과목의 점수를 입력해주세요");
        if (userInput === null){
            return
        }
        if (userInput === "" || isNaN(Number(userInput)) || Number(userInput) > 100 || Number(userInput) < 0) {
            alert("올바른 값을 입력해주세요!");
            i--;
            continue; 
        }
        total += Number(userInput);

    }
    var average = (total / subjects.length).toFixed(1);
    var result
    if(average>=60){
        result = " 🎉 합격입니다! 우수자로 선정되었습니다."
    }
    else{
        result = " 😭 불합격입니다."
    }

    alert("*******📊성적표*******\n"
        + "- 총점 : "+ total + "점\n"
        + "- 평균 : "+ average + "점\n"
        + "**************\n"
        + result)
    
}