//
// skulpt_runner.js
// ----------------
// Ejecuta código Python dentro de Skulpt
//

// Función de impresión (print)
function skulptOut(text) {
    skulptRunner.output += text + "\n";
}

// Función para lectura de archivos stdlib de Skulpt
function builtinRead(x) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined) {
        throw "No se encontró archivo: " + x;
    }
    return Sk.builtinFiles["files"][x];
}

// Objeto runner global
const skulptRunner = {
    output: "",

    ejecutar: async function (codigo, outputElement) {
        this.output = "";
        outputElement.textContent = "Ejecutando...";

        try {
            Sk.configure({
                output: skulptOut,
                read: builtinRead
            });

            const result = await Sk.misceval.asyncToPromise(() =>
                Sk.importMainWithBody("<stdin>", false, codigo, true)
            );

            outputElement.textContent = this.output || "(Sin salida)";
        } catch (err) {
            outputElement.textContent = "Error:\n" + err.toString();
        }
    }
};
