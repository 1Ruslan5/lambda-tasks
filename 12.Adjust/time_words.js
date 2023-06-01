function words(amount, language,typeOfFIle){
    let sumMony;
    let typeFile = ['doc', 'docx', 'rtf'];
    if(language === 'en'){
        sumMony = (amount <= 1000)? 120: amount * 0.12;
    }else if (language === 'ua' || language === 'ru'){
        sumMony = (amount <= 1000)? 50: amount * 0.05;
    }else{
        return "Not valid language"
    }
    if(!typeFile.includes(typeOfFIle)){
        sumMony = sumMony + (sumMony * 0.20)
    }
    return sumMony
}

function time(amount, language, typeOfFIle, date = new Date()){
    let sumTime;
    let days, hours, minutes;
    let eng = 333;
    let uk_ru = 1333;
    let typeFile = ['doc', 'docx', 'rtf'];
    if(language === 'en'){
        sumTime = 30 + (Math.ceil(amount/eng)*60);  
    }else if (language === 'ua' || language === 'ru'){
        sumTime = 30 + (Math.ceil(amount/uk_ru)*60);
        console.log(sumTime)
    }else{
        return "Not valid language"
    }
    if(!typeFile.includes(typeOfFIle)){
        sumTime = sumTime + (sumTime * 0.20);
    }
    hours = Math.floor((sumTime) / 60);
    minutes = sumTime - (hours * 60);
    days = Math.floor(hours / 9);
    hours = hours - days * 9;
    date.setMinutes(date.getMinutes() + minutes);
    if(date.getDay() === 0 || date.getDay() === 6){
        hours += 10;
    }else{
        hours += date.getHours((date.getHours() < 10 || date.getHours() >= 19)? 10:date.getHours());
        
    }
    if(10 >= hours){
        hours += 10-date.getHours();
    }else if(19 <= hours){
        while(hours >= 19){
            hours = hours - 9;
            days++;
        }
    }
    if(date.getDay() === 0){
        date.setDate(date.getDate()+1);
    }else if (date.getDay() === 6){
        date.setDate(date.getDate()+2);
    }
    date.setHours(hours);
    while(days > 0){
        let typeDay = date.getDay();
        if(typeDay !== 0 && typeDay !== 6){
            days--;
            if(days === 0){
                break
            }
        }
        date.setDate(date.getDate()+1);
    }
    return {
        'time': `${Math.floor((sumTime) / 60)}h ${minutes}m`,
        'deadline': Math.floor(date.getTime() / 1000), 
        'deadline_data': date.toLocaleString()
    }
}
module.exports = {
    time,
    words,
};
