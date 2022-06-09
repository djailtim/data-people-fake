require('dotenv').config();

const fs = require('fs')
const { faker } = require('@faker-js/faker')

const knex = require('knex')({
    client: 'pg',
    connection: {
        host: process.env.PSQL_HOSTNAME,
        database: process.env.PSQL_DATABASE,
        user: process.env.PSQL_USERNAME,
        password: process.env.PSQL_PASSWORD
    }
});

faker.setLocale('pt_BR')

function unique(array) {
    return array.reduce((acc, curr) => {
        if (acc.includes(curr)) { return acc; }

        return acc.concat(curr);
    }, []);
}

class User {
    constructor(userData = {}) {
        this.id = userData.id || parseInt(Math.random() * 1000);

        this.name = userData.name || faker.name.findName();
        this.company = userData.company || faker.company.companyName();
        this.position = userData.position || faker.name.findName();

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

    async saveCollaborators() {
        const companyNames = unique(this.users.map((u) => u.company))
            .map((name) => ({ name }));

        const workPositionNames = unique(this.users.map((u) => u.position))
            .map((name) => ({ name }));

        const companiesInDb = await knex('companies')
            .insert(companyNames)
            .onConflict('name')
            .merge()
            .returning('*');

        const workPositionsInDb = await knex('working_positions')
            .insert(workPositionNames)
            .returning('*');

        await knex('collaborators').insert(this.users.map((u) => ({
            company_id: companiesInDb
                .find((c) => c.name === u.company).id,

            working_position_id: workPositionsInDb
                .find((w) => w.name === u.position).id,

            name: u.name,
            email: u.email,
            cellphone: u.phoneNumber
        })));
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
    console.log('Started!');
    const userFiles = new UserFiles();
    await userFiles.loadFromFile('./users.json');

    userFactory(userFiles, 10);

    await userFiles.writeJson('./users.json');
    await userFiles.writeCsv('./users.csv');

    await userFiles.saveCollaborators();
    console.log('Done!');

    knex.destroy();
})();

// SELECT
//     c.id,
//     c.name,
//     company.name as company_name,
//     wp.name as working_position_name
// FROM
//     collaborators as c
// INNER JOIN
//     companies as company
//         ON company.id = c.company_id
// INNER JOIN
//     working_positions as wp
//         ON wp.id = c.working_position_id;
