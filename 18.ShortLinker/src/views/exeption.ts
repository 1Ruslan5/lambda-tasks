const jsonAwnswear = (status: number, info: string) => {
    const exeption = new Map([
        [400, 'Bad Request'],
        [201, 'Created'],
        [200, 'Ok'],
        [404, 'Not found'],
    ]);
    return { status, exeption: exeption.get(status), info }
}


const linkNotFound = { err: "Sorry, no such short link founded" };
const linkNotInput = jsonAwnswear(404, "Link didn't found");

export { linkNotFound, linkNotInput } 