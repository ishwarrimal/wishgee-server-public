# WishGee backend Build with NODE and TypeORM

Steps to run this project:

1. Run `npm i` command
2. Setup database settings inside `ormconfig.json` file
3. Run `npm start` command

psql -d postgres -U wishgee;

stop server
brew services stop postgresql;

start server
pg_ctl -D /usr/local/var/postgres start


Setting up first time:

1. install Node, python.
2. For Windows install Visual Studio.
3. For Windows: npm install -g windows-build-tools
4. Global install yarn (We need yarn)
5. Global install ts-node
6. Download and install postgresql 
```
brew install postgresql
brew services start postgresql
psql postgres
create user myuser with encrypted password 'mypass';
grant all privileges on database mydb to myuser;
postgres=# \c mydb;
```
7. Create user ishwar (any name) and database wishgee with password (kepe those in env variables)
8. Baki toh khud sambhal lena yaar, developer he baccha nahi.

If you face any issue while starting local server, run the following code:  
```
$ rm /usr/local/var/postgres/postmaster.pid
$ brew services restart postgresql
```

.env for development
```
DEV_DATABASE_URL=postgres://user:password@localhost:5432/database
PORT=8080
```
