function analyzeInput(){

    let input =
    document.getElementById("inputBox").value;


    let func =
parseFunction(input.replace("y=",""));


    if(!func){

        showResult("Could not understand function.");
        return;

    }


    let roots =
    findRoots(func);


    let output =
    "Analysis:\n\n";


    if(roots.length > 0){

        output += "Roots:\n";

        roots.forEach(root=>{

            output += 
            "x = " + root.toFixed(4) + "\n";

        });

    }

    else{

        output += "No roots found.\n";

    }


    showResult(output);

}




function findRoots(func){


    let roots=[];


    let previousX=-10;
    let previousY=func(previousX);



    for(
        let x=-10;
        x<=10;
        x+=0.05
    ){


        let y=func(x);



        if(!isFinite(y)){

            previousX=x;
            previousY=y;
            continue;

        }



        // sign change means crossing x axis

        if(
            previousY*y < 0
        ){

            roots.push(
                (previousX+x)/2
            );

        }



        previousX=x;
        previousY=y;


    }



    return roots;

}




function showResult(text){

    document.getElementById(
        "resultText"
    ).innerText=text;

}

function calculateInput(){

    let input =
    document.getElementById("inputBox")
    .value
    .trim()
    .toLowerCase();


    if(input.startsWith("solve")){

        solveEquation(
            input.replace("solve","").trim()
        );

    }


    else if(
        input.startsWith("differentiate")
    ){

        let expression =
        input
        .replace("differentiate","")
        .trim();


        differentiate(expression);

    }

    else if(input.startsWith("integrate")){

    let expression =
    input.replace("integrate","").trim();


    if(expression.includes("from")){

        definiteIntegral(expression);

    }

    else{

        integrate(expression);

    }

}


    else{

        let answer =
        evaluateMath(input);


        if(answer===null){

            showResult(
                "Could not calculate."
            );

        }
        else{

            showResult(
                "Answer:\n"+answer
            );

        }

    }

}

function solveEquation(equation){

    let sides = equation.split("=");


    if(sides.length !== 2){

        showResult("Invalid equation.");
        return;

    }


    let left = sides[0]
        .replace(/\s/g,"");

    let right = sides[1]
        .replace(/\s/g,"");


    // Move everything to one side

    let expr = left + "-(" + right + ")";


    // Try quadratic first

    let quadratic = parseQuadratic(expr);


    if(quadratic){

        let a = quadratic.a;
        let b = quadratic.b;
        let c = quadratic.c;


        let d =
        b*b - 4*a*c;


        if(d < 0){

            showResult(
                "No real solutions."
            );

            return;

        }


        let x1 =
        (-b + Math.sqrt(d))
        /
        (2*a);


        let x2 =
        (-b - Math.sqrt(d))
        /
        (2*a);


        showResult(
            "Solutions:\n\nx = "
            + x1.toFixed(3)
            +
            "\nx = "
            + x2.toFixed(3)
        );


        return;

    }


    // Otherwise use linear solver

    solveLinear(expr);

}

function parseQuadratic(expr){

    expr = expr.replace(/\s/g,"");

    expr = expr.replace(
        /-\(0\)/g,
        ""
    );


    // Remove * signs
    expr = expr.replace(/\*/g,"");


    let a = 0;
    let b = 0;
    let c = 0;


    // Find x² term
    let aMatch = expr.match(
        /([+-]?\d*)x\^2/
    );


    if(aMatch){

        a = aMatch[1];

        if(a==="" || a==="+")
            a=1;

        if(a==="-")
            a=-1;

        a = Number(a);

    }


    // Find x term
    let bMatch = expr.match(
        /([+-]\d*)x(?!\^)/
    );


    if(bMatch){

        b = Number(bMatch[1]);

    }


    // Remove x terms and get constant
    let constant = expr
        .replace(
            /[+-]?\d*x\^2/,
            ""
        )
        .replace(
            /[+-]\d*x/,
            ""
        );


    if(constant){

        c = Number(constant);

    }


    if(a===0){

        return null;

    }


    return {
        a:a,
        b:b,
        c:c
    };

}

function solveLinear(expr){

    let func =
    parseFunction(expr);


    if(!func){

        showResult(
            "Could not solve."
        );

        return;

    }


    let answer=null;


    for(
        let x=-100;
        x<=100;
        x+=0.001
    ){

        if(
            Math.abs(func(x))<0.01
        ){

            answer=x;
            break;

        }

    }


    if(answer!==null){

        showResult(
            "Solution:\n\nx = "
            +answer.toFixed(3)
        );

    }

    else{

        showResult(
            "No solution found."
        );

    }

}

function differentiate(expr){

    expr = expr.replace(/\s/g,"");


    // Split addition/subtraction terms

    let terms = expr.match(
        /[+-]?[^+-]+/g
    );


    if(!terms){
        showResult("Cannot parse expression.");
        return;
    }


    let answers=[];


    for(let term of terms){


        let sign="";

        if(term[0]==="+"){
            sign="+";
            term=term.substring(1);
        }

        if(term[0]==="-"){
            sign="-";
            term=term.substring(1);
        }



        let derivative =
        derivativeTerm(term);



        if(derivative==="0"){
            continue;
        }


        if(sign==="-" && derivative!=="0"){

            derivative="-"+derivative;

        }

        else if(
            sign==="+" &&
            answers.length>0
        ){

            derivative="+"+derivative;

        }


        answers.push(derivative);

    }


    let result =
answers.join("");

result =
simplifyExpression(result);


    if(result===""){
        result="0";
    }


    showResult(
        "Derivative:\n\n"+result
    );

}

function derivativeTerm(term){


    // constant

    if(!term.includes("x")){

        return "0";

    }



    // x^n

    let power =
    term.match(
        /^(\d*)x\^(\d+)$/
    );


    if(power){


        let coefficient =
        power[1] || 1;


        let exponent =
        Number(power[2]);


        let newCoefficient =
        coefficient * exponent;


        let newExponent =
        exponent-1;



        if(newExponent===0){

            return ""+newCoefficient;

        }


        if(newCoefficient===1){

            return "x^"+newExponent;

        }


        return (
            newCoefficient+
            "x^"+
            newExponent
        );

    }



    // coefficient*x

    let linear =
    term.match(
        /^(\d*)x$/
    );


    if(linear){


        return linear[1] || "1";

    }



    // x

    if(term==="x"){

        return "1";

    }



    // sin(x)

    if(term==="sin(x)"){

        return "cos(x)";

    }



    // cos(x)

    if(term==="cos(x)"){

        return "-sin(x)";

    }

    // Product rule

if(term.includes("*")){


    let parts =
    term.split("*");


    if(parts.length===2){


        let u=parts[0];
        let v=parts[1];


        let du =
        derivativeTerm(u);


        let dv =
        derivativeTerm(v);



        return (
            "("+
            du+
            "*"+
            v+
            "+"+
            u+
            "*"+
            dv+
            ")"
        );

    }

}

// Quotient rule

if(term.includes("/")){


    let parts =
    term.split("/");


    if(parts.length===2){


        let u=parts[0];
        let v=parts[1];


        let du =
        derivativeTerm(u);


        let dv =
        derivativeTerm(v);



        return (
            "("+
            du+
            "*"+
            v+
            "-"+
            u+
            "*"+
            dv+
            ")/("+
            v+
            ")^2"
        );

    }

}

// Chain rule: sin(...)

let sinInside =
term.match(
    /^sin\((.+)\)$/
);


if(sinInside){


    let inside =
    sinInside[1];


    let derivativeInside =
    derivativeTerm(inside);



    return (
        "cos("+
        inside+
        ")*"+
        derivativeInside
    );

}



// Chain rule: cos(...)

let cosInside =
term.match(
    /^cos\((.+)\)$/
);


if(cosInside){


    let inside =
    cosInside[1];


    let derivativeInside =
    derivativeTerm(inside);



    return (
        "-sin("+
        inside+
        ")*"+
        derivativeInside
    );

}



    return "?";

}

function simplifyExpression(expr){

    expr = expr.replace(/\s/g,"");


    // Remove unnecessary brackets

    expr = expr.replace(
        /\(([^()]+)\)/g,
        "$1"
    );


    // 0 + something

    expr = expr.replace(
        /0\+/g,
        ""
    );


    // something + 0

    expr = expr.replace(
        /\+0/g,
        ""
    );


    // 0 * something

    expr = expr.replace(
        /0\*[^+\-*/]+/g,
        "0"
    );


    // something * 0

    expr = expr.replace(
        /[^+\-*/]+\*0/g,
        "0"
    );


    // 1 * something

    expr = expr.replace(
        /1\*/g,
        ""
    );


    // something * 1

    expr = expr.replace(
        /\*1/g,
        ""
    );


    // x^1 -> x

    expr = expr.replace(
        /\^1/g,
        ""
    );


    // x^0 -> 1

    expr = expr.replace(
        /\w+\^0/g,
        "1"
    );


    // -- becomes +

    expr = expr.replace(
        /--/g,
        "+"
    );


    // +- becomes -

    expr = expr.replace(
        /\+\-/g,
        "-"
    );

    // simplify coefficient fractions

expr = expr.replace(
    /(\d+)x\^2\/2/g,
    function(match,num){

        if(num==2){

            return "x^2";

        }

        return num+"x^2/2";

    }
);


    return expr;

}

function integrate(expr){

    expr =
    expr.replace(/\s/g,"");


    let terms =
    expr.match(
        /[+-]?[^+-]+/g
    );


    if(!terms){

        showResult(
            "Cannot integrate."
        );

        return;

    }


    let answers=[];


    for(let term of terms){


        let sign="";


        if(term[0]==="+"){

            sign="+";
            term=term.substring(1);

        }


        if(term[0]==="-"){

            sign="-";
            term=term.substring(1);

        }


        let result =
        integrateTerm(term);



        if(sign==="-" && result){

            result="-"+result;

        }

        else if(
            sign==="+" &&
            answers.length>0
        ){

            result="+"+result;

        }


        answers.push(result);

    }


    let final =
    answers.join("");


    final =
    simplifyExpression(final);


    showResult(
"Integral:\n\n"
+final+
" + C"
);

}

function integrateTerm(term){


    // Constant

    if(!term.includes("x")){

        return term+"x";

    }

    // coefficient*x^power

let coefficientPower =
term.match(
    /^(\d+)x\^(\d+)$/
);


if(coefficientPower){

    let coefficient =
    Number(coefficientPower[1]);


    let exponent =
    Number(coefficientPower[2]);


    let newExponent =
    exponent+1;


    return (
        coefficient+
        "x^"+
        newExponent+
        "/"+
        newExponent
    );

}



    // x^n

    let power =
    term.match(
        /^(\d*)x\^(\d+)$/
    );


    if(power){


        let coefficient =
        power[1] || 1;


        let exponent =
        Number(power[2]);


        let newExponent =
        exponent+1;


        return (
            coefficient+
            "x^"+
            newExponent+
            "/"+
            newExponent
        );

    }



    // x

    if(term==="x"){

        return "x^2/2";

    }



    // sin(x)

    if(term==="sin(x)"){

        return "-cos(x)";

    }



    // cos(x)

    if(term==="cos(x)"){

        return "sin(x)";

    }

    // coefficient*x

let linear =
term.match(
    /^(\d+)x$/
);


if(linear){

    let coefficient =
    Number(linear[1]);


    return (
        coefficient+
        "x^2/2"
    );

}

// e^x

if(term==="e^x"){

    return "e^x";

}

// tan(x)

if(term==="tan(x)"){

    return "-ln(cos(x))";

}

// sec(x)^2

if(
    term==="sec(x)^2"
){

    return "tan(x)";

}

// simple 2x

if(term==="2x"){

    return "x^2";

}



    return "?";

}

function definiteIntegral(input){

    let parts =
    input.split("from");


    let functionText =
    parts[0].trim();


    let bounds =
    parts[1].split("to");


    if(bounds.length!=2){

        showResult("Invalid bounds.");

        return;

    }


    let lower =
    Number(bounds[0]);

    let upper =
    Number(bounds[1]);


    let func =
    parseFunction(functionText);


    if(!func){

        showResult("Could not parse function.");

        return;

    }


    let area = 0;

const dx = 0.0001;

for(let x = lower; x < upper; x += dx){

    let y1 = func(x);
    let y2 = func(x + dx);

    area += (y1 + y2) * dx / 2;

}


    showResult(
        "Definite Integral\n\n"+
        "Area = "+
        area.toFixed(6)
    );


    if(typeof shadeIntegral==="function"){

        shadeIntegral(
            func,
            lower,
            upper
        );

    }

}