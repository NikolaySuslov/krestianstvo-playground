function styles() {

    const buttonGreen = () => {
        return "m1 bg-green-200 hover:bg-green-300 text-sm text-black font-mono font-light py-2 px-4 rounded border-2 border-green-200"
    }

    const buttonRed = () => {
        return "m1 bg-red-200 hover:bg-red-300 text-sm text-black font-mono font-light py-2 px-4 rounded border-2 border-red-200"
    }

    const smallButton = () => {
        return "m1 bg-green-200 hover:bg-green-300 text-sm text-black font-mono font-light py-1 px-2 rounded border-2 border-green-200"
    }

    const buttonGrey = () => {
        return "m1 bg-grey-200 hover:bg-grey-300 text-sm text-black font-mono font-light py-2 px-4 rounded border-2 border-grey-200"
    }
   

    return { buttonGreen, smallButton, buttonRed, buttonGrey }
}


export default styles()