document.addEventListener('DOMContentLoaded', function () {
    init()

    $('#name').keyup(handleNameKeyup)

    nameUrlParameter(handleResolve)

    $('#modal-mycrypto').on('shown.bs.modal', () => {
        let name = $('#name').val()
        let hash = namehash(name + '.' + config.tld)

        $('#modal-domain').html(name + '.' + config.tld)

        $('.modal-hash').html(hash)
        $('.modal-copy-hash').click(() => {
            let e = document.createElement('textarea')
            e.value = hash
            let p = document.getElementById('modal-mycrypto')
            p.appendChild(e)
            e.select()
            document.execCommand('copy')
            p.removeChild(e)
        })

        $('#modal-domain-status').prop('href', '/domain-status?name=' + name)
    })
})

/**
 * Get a domain resolution from backend
 */
function handleResolve () {
    let name = $('#name').val()

    pushState(name)

    $.ajax({
        type: 'GET',
        url: window.location.origin + '/resolvename',
        data: { 'name': name },
        beforeSend: () => $('#name-action-loading').show(),
        complete: () => $('#name-action-loading').hide(),
        success: (res) => displayResolution(res),
        error: (xhr, ajaxOptions, thrownError) => $('#server-error').show()
    })

    return false
}

/**
 * Displays the resoluction of a name
 * @param {string} res response from backend /resolvename
 */
function displayResolution (res) {
    let name = $('#name').val()
    let response = JSON.parse(res)

    let labels = name.split('.')

    if (notNullAddress(response)) {
        let checksummed = typeof web3 !== 'undefined' ? toChecksumAddress(response, config.chainid) : response
        $('#address').html(checksummed)
        $('#qr').prop('src', 'https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=' + checksummed + '&choe=UTF-8')
        $('#copy').show()
    } else {
        $('#address').html('No resolution was found. The domain may be available for registration!<br><br>' +
            '<a class="btn btn-default btn-sm" href="/domain-status?name=' + labels[labels.length-1] + '">Check the domain status</a>')
        $('#qr').prop('src', '')
        $('#copy').hide()
    }

    $('#result').show()
}

/**
 * copy resolved address in clipboard
 */
function copy () {
    const el = document.createElement('textarea')
    el.value = $('#address').html()
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
}
