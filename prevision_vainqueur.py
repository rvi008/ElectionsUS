import numpy as np
import pandas as pd
import json

def load_data(p=.6): # proba de garder un état de sa couleur politique
    df = pd.read_csv('state.csv')
    probas_dem = []
    for gouv in df['gouv']:
        if gouv == 'Rép.':
            probas_dem.append(1 - p)
        elif gouv == 'Dém.':
            probas_dem.append(p)
        else:
            probas_dem.append(.5)
    df['proba_dem'] = probas_dem
    return df

def update_simulation(df, etat=None, gagnant=1):
    # a chaque résultat d'un état qui tombe on met à jour la grille des probas et on relance la simulation
    if etat != None:
        df.loc[np.argmax(df['State']==etat), 'proba_dem'] = gagnant # 1 si les démocrates ont pris l'état, 0 sinon

    # simulation monte carlo pour estimer la proba de victoire des démocrates
    B = 100
    dem = 0
    for i in range(0, B):
        if np.sum(df['nb_elector'][np.random.rand(51) < df['proba_dem']]) > 270:
            dem += 1
    result = dem / B

    return result # proba que les démocrates gagnent les élections

df = load_data(p=.55) # à faire une fois pour calibrer le modèle

df2 = df
# à relancer après chaque résultat (puis dumper dans un JSON?)
print(update_simulation(df2, 'CA', gagnant=1))
