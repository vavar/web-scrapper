# NodeJS Web Scrapper Demonstration

This project is used for NodeJS implementation demonstrate
by gather data from target website with web scraping technique.

-----
## Prerequisite

- NodeJS 4 -- LTS or higher

## Installation

run following command at project's root folder
- npm install

## Usage

### Run
run project with following command:
- `npm start` - server will be running on port 8080

### Unit Testing
unit tesing with following command:
- `npm test` - invoke jasmine testing framework

## API
while server is running, 
you can access Stock index data from following APIs:

### RESTful Service
- `/api/chart` - get latest stock index for 50 records
- `/api/chart/:amount` - get latest stock index for :amount records


### Data Model Example

````
{
   data: [ { x: date-time , y : index-value } , ...]
}
````
