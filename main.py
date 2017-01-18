import pymongo
import pandas as pd
import json
import datetime
import time
import numpy as np 


mytime = 1478635200
start = time.time()

dicoStates = {"Hawai":"HI","Alaska":"AK","Floride":"FL","New_Hampshire":"NH","Michigan":"MI","Vermont":"VT","Maine":"ME","Rhode_Island":"RI","New_York":"NY","Pennsylvanie":"PA","New_Jersey":"NJ","Delaware":"DE","Maryland":"MD","Virginie":"VA","Virginie_Occidentale":"WV","Ohio":"OH","Indiana":"IN","Illinois":"IL","Connecticut":"CT","Wisconsin":"WI","Caroline_du_Nord":"NC","District_de_Columbia":"DC","Massachusetts":"MA","Tennessee":"TN","Arkansas":"AR","Missouri":"MO","Georgie":"GA","Caroline_du_Sud":"SC","Kentucky":"KY","Alabama":"AL","Louisiane":"LS","Mississippi":"MS","Iowa":"IA","Minnesota":"MN","Oklahoma":"OK","Texas":"TX","Nouveau_Mexique":"NM","Kansas":"KS","Nebraska":"NE","Dakota_du_Sud":"SD","Dakota_du_Nord":"ND","Wyoming":"WY","Montana":"MT","Colorado":"CO","Idaho":"ID","Utah":"UT","Arizona":"AZ","Nevada":"NV","Oregon":"OR","Washington":"WA","Californie":"CA"}
c = pymongo.MongoClient('mongodb://ip-10-0-2-198:27017,ip-10-0-4-219:27017,ip-10-0-3-211:27017/?replicaSet=s-1')

candidats = ["Trump", "Clinton", "Blanc"]

while(1) :
    elapsed_time = time.time() - start
    #print(datetime.datetime.fromtimestamp(mytime+10*elapsed_time))
    result = list(c.elections.votes_2.find({"timestamp":{"$lte":datetime.datetime.fromtimestamp(mytime+30*elapsed_time)}}))
    df = pd.DataFrame(result)
    df["candidate"] = df["candidate"].map(lambda x: "Autre" if x not in candidats else x)
    df1 = df.groupby(["candidate", "state"]).sum()
    df1 = df1.reset_index()
    df1 = df1.pivot(index = "state", columns="candidate", values="voix")
    df1 = df1.reset_index()
    if "Blanc" not in list(df1.columns):
        df1["Blanc"] = 0

    df1  = df1.fillna(0) 
    df1["state"] = df1["state"].map(lambda x : dicoStates[x])
    df1["color"] = "#000000"
    df1["color"] = (np.argmax(df1[["Trump","Clinton"]].values, axis=1))
    df1["color"] = df1["color"].map(lambda x : "#FF0000" if x ==0 else "#3399FF")
    #df1 = df1.set_index("state")
    
    
    dfEmpty = pd.DataFrame(columns = ['state', "Trump", "Blanc", "Clinton", "Autre", "color"])
    
    dfEmpty["state"] = [elem for elem in dicoStates.values() if elem not in list(df1.state)]
    dfEmpty["Trump"] = 0
    dfEmpty["Blanc"] = 0
    dfEmpty["Clinton"] = 0
    dfEmpty["Autre"] = 0
    dfEmpty["color"] = "#FBF8EF"

    df1 = pd.concat([df1,dfEmpty])
    print(df1)
    dico = {}
    for col in df1.state.unique():
        dico2 = {}
        for item in ["Autre", "Blanc", "Clinton", "Trump", "color"]:
            dico2[item] = df1[df1["state"] == col][item].values[0]
        dico[col] = dico2

    print(dico)
    
    
    file = open("/var/www/html/donneesVotes2.json", "w")
    json.dump(dico,file)
    file.close()
    if elapsed_time >= 3700 : break
    time.sleep(5)



#######################
	###########
########################
# On crée un deuxième json qui aggrège les résultats à l'instant t au niveau national
# MODIFIER UTILISER DIRECTEMENT LE DICO SI POSSIBLE

data = json.load(open("donneesVotes2.json"))
# Import du nombre de grands electeurs par état 
base_elec = pd.read_csv("state.csv")

result = pd.DataFrame(columns=["name","vote"])
result = result.append({"name":"Clinton","vote":0}, ignore_index=True)
result  = result.append({"name":"Trump","vote":0}, ignore_index=True)			

for state in dicoStates.values():

	try :
		vote_clinton = data[state]["Clinton"]
		vote_trump = data[state]["Trump"]

		vote_electeur = base_elec.loc[base_elec["State"]==state,"nb_elector"].values

		if vote_clinton > vote_trump :
			
			result.loc[result["name"]=="Clinton", "vote"] +=  vote_electeur[0] 	
		else :
			result.loc[result["name"]=="Trump", "vote"] += vote_electeur[0]

	except KeyError :
		continue

result.to_json("test.json", orient="index")