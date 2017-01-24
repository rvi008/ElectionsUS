<h1> NoSQL Project : Simulation of 2016's US Election Counting</h1>

<p text-align="center">This project aims to simulate the US election counting in streaming.
During the simulation, we have to handle a fault of the database.</p>

<h2>Architecture</h2>
<p text-align="center">The architecture chosen is the following</p>
<ul>
<li>An AWS cluster of 5 micro instances</li>
<li>2 instances are NAT (a secondary and a primary) which host the software and http site</p>
<li>3 instances are MongoDB replica sets</li>
</ul>

<h2>ETL</h2>
<p text-align="center">The raw data are CSV files, one by states, with one line per vote, with timestamp, state and the candidate.
The timestamp is the same for each vote inside one file so we proceeded this way : </p>
<ul>
<li>Import the data into mongoDB with a bash script invoking Mongoimport</li>
<li>Aggregate the data by timestamp / state and candidate and store it in an other collection</li>
<li>Dump the first collection</li>
</ul>

<h2>Data retrieval and display</h2>
<p text-align="center">The backend is realised with python, we use Pymongo to connect to the Database and export the aggregated data in 
JSON. The frontend is realised in HTML/CSS/JS (d3.js), the system works as follow :</p>
<ul>
<li>Connect to the DB, try to export the data (and manage the fault-tolerance in case of one of the replica set fails)</li>
<li>Export them in JSON</li>
<li>Periodically load the data in AJAX in the index.html</li>
<li>Refresh the map, number of Great Electors by candidates, and the winner's estimation with fresher data</li>
</ul> 
 
