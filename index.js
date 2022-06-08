const fs = require('fs')
const { faker } = require('@faker-js/faker')

const data = './fake.json'

faker.setLocale('pt_BR')

const user = () => ({
  name: faker.name.findName(),
  company: faker.company.companyName(),
  birthdate: faker.date.birthdate(),
  jobType: faker.name.jobType(),
  phoneNumber: faker.phone.phoneNumber(),
  address: {
    streetAddress: faker.address.streetAddress(),
    city: faker.address.city(),
    state: faker.address.state()
  }
})

const users = []

for (let i = 0; i < 10; i++) {
  const createdUser = user()
  users.push(createdUser)
}

try {
  const contentData = fs.readFileSync(data)
  const contentDataParsed = JSON.parse(contentData)

  const newGroupUsers = contentDataParsed
    ? [...contentDataParsed, ...users]
    : [...users]

  fs.writeFileSync(data, JSON.stringify(newGroupUsers))
  console.log(
    `Foram inseridos ${users.length}, totalizando ${newGroupUsers.length} registros!`
  )
  console.table(newGroupUsers, ['name', 'birthdate'])

  const dataCSV = newGroupUsers.map((user) => {
    const id = parseInt(Math.random() * 1000)
    const name = user.name
    const birth = new Intl.DateTimeFormat('pt-BR').format(
      new Date(user.birthdate)
    )
    const company = user.company
    const jobType = user.jobType
    const phoneNumber = user.phoneNumber
    const address = `${user.address.streetAddress}, ${user.address.city} - ${user.address.state}`

    return `${id};${name};${company};${birth};${jobType};${phoneNumber};${address}\\r\\n`
  })

  let csvString = dataCSV.toString()

  fs.writeFileSync('./fake.csv', csvString)
  console.log('Arquivo CSV exportado com sucesso!')
} catch (error) {
  console.error(error)
}
