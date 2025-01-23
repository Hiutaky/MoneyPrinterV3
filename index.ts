import { App } from "./src/app";


const main = async () => {
    App.listen({
        port: 3000,
        idleTimeout: 255,
    });
    console.log("Running Server on port 3000");
};

main()
    .then()
    .catch((e) => console.error(e));
