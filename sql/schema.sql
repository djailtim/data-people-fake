-- DOC)
-- oqueeh_nomedatabela_nomedacolunaoureferencoa

-- pk === PRIMARY KEY
-- uq === UQ
-- fk === FK
-- df === DEFAULT KEY
-- seq_nomedatabela === SEQUENCE

-- se vc tem uma consulta em um db muito grande e essa consulta esta lenta
-- muito provavelmente ela nao esta batendo em index.

-- consulta lenta no db
-- 1) checar indices
-- 2) checar tipo de colunas
-- 3) sizes

-- companies
-- users
-- collaborators
-- service_orders
-- working_progress
-- teams
-- installation_sites
-- collaborator_in_service_orders

CREATE SEQUENCE seq_companies;
CREATE TABLE companies (
    id INT NOT NULL
        CONSTRAINT pk_companies PRIMARY KEY
        DEFAULT nextval('seq_companies'),

    name text not null CONSTRAINT uq_companies_name UNIQUE,
    utc_created_on timestamp NOT NULL
        CONSTRAINT df_companies_utc_created_on DEFAULT(now())
);
ALTER SEQUENCE seq_companies OWNED BY companies.id;

CREATE TYPE user_role AS ENUM ('operator', 'admin');
CREATE SEQUENCE seq_users;
CREATE TABLE users (
    id INT NOT NULL
        CONSTRAINT pk_users PRIMARY KEY
        DEFAULT nextval('seq_users'),

    login text not null CONSTRAINT uq_users_login UNIQUE,
    password text not null,

    name text not null,
    email text not null,

    role user_role NOT NULL,
    utc_created_on timestamp NOT NULL
        CONSTRAINT df_users_utc_created_on DEFAULT(now())
);
ALTER SEQUENCE seq_users OWNED BY users.id;

CREATE SEQUENCE seq_working_positions;
CREATE TABLE working_positions (
    id INT NOT NULL
        CONSTRAINT pk_working_positions PRIMARY KEY
        DEFAULT nextval('seq_working_positions'),

    name text not null,
    utc_created_on timestamp NOT NULL
        CONSTRAINT df_working_positions_utc_created_on DEFAULT(now())
);
ALTER SEQUENCE seq_working_positions OWNED BY working_positions.id;

CREATE SEQUENCE seq_collaborators;
CREATE TABLE collaborators (
    id INT NOT NULL
        CONSTRAINT pk_collaborators PRIMARY KEY
        DEFAULT nextval('seq_collaborators'),

    company_id INT NOT NULL
        CONSTRAINT fk_collaborators_companies
        REFERENCES companies(id),

    working_position_id INT NOT NULL
        CONSTRAINT fk_collaborators_working_positions
        REFERENCES working_positions(id),

    name text not null,
    email text,
    cellphone text,
    more_info text,

    utc_created_on timestamp NOT NULL
        CONSTRAINT df_collaborators_utc_created_on DEFAULT(now())
);
ALTER SEQUENCE seq_collaborators OWNED BY collaborators.id;

CREATE SEQUENCE seq_teams;
CREATE TABLE teams (
    id INT NOT NULL
        CONSTRAINT pk_teams PRIMARY KEY
        DEFAULT nextval('seq_teams'),

    name text not null,
    utc_created_on timestamp NOT NULL
        CONSTRAINT df_teams_utc_created_on DEFAULT(now())
);
ALTER SEQUENCE seq_teams OWNED BY teams.id;

CREATE TABLE team_collaborators (
    team_id INT NOT NULL
        CONSTRAINT fk_team_collaborators_teams
        REFERENCES teams(id),

    collaborator_id INT NOT NULL
        CONSTRAINT fk_team_collaborators_collaborators
        REFERENCES collaborators(id),

    CONSTRAINT pk_team_collaborators PRIMARY KEY (
        team_id,
        collaborator_id
    )
);

CREATE SEQUENCE seq_service_orders;
CREATE TABLE service_orders (
    id INT NOT NULL
        CONSTRAINT pk_service_orders PRIMARY KEY
        DEFAULT nextval('seq_service_orders'),

    company_id INT NOT NULL
        CONSTRAINT fk_service_orders_companies
        REFERENCES companies(id),

    head_turn_id INT NOT NULL
        CONSTRAINT fk_service_orders_collaborators
        REFERENCES collaborators(id),

    team_id INT NOT NULL
        CONSTRAINT fk_service_orders_teams
        REFERENCES teams(id),

    open_on timestamp,
    closed_on timestamp,

    utc_created_on timestamp NOT NULL
        CONSTRAINT df_service_orders_utc_created_on DEFAULT(now())
);
ALTER SEQUENCE seq_service_orders OWNED BY service_orders.id;

CREATE TABLE service_order_collaborators (
    service_order_id INT NOT NULL
        CONSTRAINT fk_team_collaborators_service_orders
        REFERENCES service_orders(id),

    collaborator_id INT NOT NULL
        CONSTRAINT fk_team_collaborators_collaborators
        REFERENCES collaborators(id),

    CONSTRAINT pk_service_order_collaborators PRIMARY KEY (
        service_order_id,
        collaborator_id
    )
);
