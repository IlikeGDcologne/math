function parseFunction(input){

    input = input.toLowerCase();

    // Remove y=
    input = input.replace(/^y=/, "");

    // Remove spaces
    input = input.replace(/\s+/g, "");


    // Absolute value
    input = input.replace(
        /\|([^|]+)\|/g,
        "abs($1)"
    );


    // Convert powers
    input = input.replace(
        /\^/g,
        "**"
    );


    // Add multiplication

    // 2x -> 2*x
    input = input.replace(
        /(\d)(x)/g,
        "$1*$2"
    );


    // 2sin(x) -> 2*sin(x)
    input = input.replace(
        /(\d)(Math\.)/g,
        "$1*$2"
    );


    // xsin(x) -> x*sin(x)
    input = input.replace(
        /(x)(Math\.)/g,
        "$1*$2"
    );


    // )sin(x) -> )*sin(x)
    input = input.replace(
        /(\))(Math\.)/g,
        "$1*$2"
    );


    // Functions

    input = input.replace(
        /sin\(/g,
        "Math.sin("
    );

    input = input.replace(
        /cos\(/g,
        "Math.cos("
    );

    input = input.replace(
        /tan\(/g,
        "Math.tan("
    );

    input = input.replace(
        /sqrt\(/g,
        "Math.sqrt("
    );

    input = input.replace(
        /abs\(/g,
        "Math.abs("
    );

    input = input.replace(
        /ln\(/g,
        "Math.log("
    );

    input = input.replace(
        /log\(/g,
        "Math.log10("
    );


    // Constants

    input = input.replace(
        /pi/g,
        "Math.PI"
    );


    input = input.replace(
        /\be\b/g,
        "Math.E"
    );


    try{

        return function(x){

            return Function(
                "x",
                "return " + input
            )(x);

        };

    }

    catch(error){

        console.log(
            "Parser error:",
            error
        );

        return null;

    }

}

function evaluateMath(input){

    input = input.toLowerCase();

    input = input.replace(/\s+/g,"");


    input = input.replace(
        /\^/g,
        "**"
    );


    input=input.replace(
        /sin\(/g,
        "Math.sin("
    );

    input=input.replace(
        /cos\(/g,
        "Math.cos("
    );

    input=input.replace(
        /tan\(/g,
        "Math.tan("
    );


    input=input.replace(
        /sqrt\(/g,
        "Math.sqrt("
    );


    input=input.replace(
        /pi/g,
        "Math.PI"
    );


    input=input.replace(
        /\be\b/g,
        "Math.E"
    );


    try{

        return Function(
            "return " + input
        )();

    }

    catch{

        return null;

    }

}