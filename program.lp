func ossequioso()
    let saluto = 'salve'

    func saluta()
        print saluto

    func setSaluto(newSaluto)
        saluto = newSaluto

    ret {
        'saluta' => saluta,
        'setSaluto' => setSaluto
    }

let oss = ossequioso()
oss['saluta']()
oss['setSaluto']('hallo')
oss['saluta']()
