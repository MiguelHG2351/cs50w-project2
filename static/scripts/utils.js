export async function isAutenticated() {
    const user = await fetch('/auth')
    const response = await user.json()
    console.log(response.success)

    return response.success
}

export async function mutationObserver(mutationList, observer) {
    if(mutationList.length > 0) {
        window.location.reload()
    }
}
