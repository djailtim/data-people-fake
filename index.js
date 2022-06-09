const fs = require('fs')
const { faker } = require('@faker-js/faker')

faker.setLocale('pt_BR')

class User {
    constructor(userData = {}) {
        this.id = userData.id || parseInt(Math.random() * 1000);

        this.name = userData.name || faker.name.findName();
        this.company = userData.company || faker.company.companyName();
        this.birthdate = userData.birthdate || faker.date.birthdate();
        this.jobType = userData.jobType || faker.name.jobType();
        this.phoneNumber = userData.phoneNumber || faker.phone.phoneNumber();

        this.address = userData.address || {
            streetAddress: faker.address.streetAddress(),
            city: faker.address.city(),
            state: faker.address.state()
        };
    }

    toCSV() {
        const { streetAddress, city, state } = this.address;

        return `${[
            this.id,
            this.name,
            this.company,
            this.birthdate,
            this.jobType,
            this.phoneNumber,
            `${streetAddress}, ${city} - ${state}`
        ].join(';')}\n`;
    }
}

class UserFiles {
    constructor(users = []) {
        this.users = users;
    }

    async loadFromFile(filepath) {
        try {
            await fs.promises.stat(filepath);
        } catch (ex) {
            if (ex.code === 'ENOENT') {
                await fs.promises.writeFile(filepath, '[]');
            } else {
                throw ex;
            }
        }

        const fileResponse = await fs.promises.readFile(filepath);
        this.users = JSON.parse(fileResponse).map((u) => new User(u));
    }

    async writeJson(filepath) {
        await fs.promises.writeFile(
            filepath,
            JSON.stringify(this.users, undefined, 4)
        );
    }

    async writeCsv(filepath) {
        const title = `${[
            'Id',
            'Nome',
            'Empresa',
            'Nascimento',
            'Funcao',
            'Telefone',
            'Endereco'
        ].join(';')}\n`;

        const csv = title + this.users.map((u) => u.toCSV()).join('');
        await fs.promises.writeFile(filepath, csv);
    }

    createUser() {
        const user = new User();
        this.users.push(user);

        return user;
    }
}

function userFactory(userFiles, maxUsers = 1) {
    for (let i = 0; i < maxUsers; ++i) {
        userFiles.createUser();
    }
}

(async () => {
    const userFiles = new UserFiles();
    await userFiles.loadFromFile('./users.json');

    userFactory(userFiles, 10);

    await userFiles.writeJson('./users.json');
    await userFiles.writeCsv('./users.csv');
})();
