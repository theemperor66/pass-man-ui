function generatePassword() {
    let length=document.getElementById("inputLength").value;
    let exclude=document.getElementById("excludedChars").value;
    let capital=document.getElementById("capitalCheck").checked;
    let digits=document.getElementById("digitCheck").checked;
    let symbols=document.getElementById("symbolCheck").checked;
    let avoidAmbiguous=document.getElementById("ambiguousCheck").checked;

    if (capital + digits + symbols > length) {
        return "The password is too short to fulfill the requirements!"
    }
    let chars = [];
    chars.push(...'abcdefghijklmnopqrstuvwxyz');
    if (capital) {
        chars.push(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    }
    if (digits) {
        chars.push(...'0123456789');
    }
    if (symbols) {
        chars.push(...'!"§$%&/()=?{[]}+*~#,;.:-_<>');
    }
    if (avoidAmbiguous) {
        chars = chars.filter((char) => !['I', 'l', '1', 'O', '0'].includes(char));
    }
    chars = chars.filter((char) => !exclude.includes(char));

    let password = "";

    for (let i = 0; i < length; i++) {
        password = password + chars[Math.floor(Math.random() * (chars.length - 1 - 1))];
    }

    document.getElementById("password").value=password;

    console.log(password);
    return password;
}
