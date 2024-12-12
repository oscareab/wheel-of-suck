import cfbd
import networkx as nx
from dotenv import load_dotenv
import os
import tqdm

def get_winner(game):
    return game.home_team if game.home_points > game.away_points else game.away_team

def get_loser(game):
    return game.home_team if game.home_points < game.away_points else game.away_team

def get_loser_score(game):
    return game.home_points if game.home_points < game.away_points else game.away_points

def get_winner_score(game):
    return game.home_points if game.home_points > game.away_points else game.away_points

def find_score(team1, team2):
    for game in games:
        if game.home_team == team1 and game.away_team == team2:
            return game.home_points, game.away_points
        elif game.home_team == team2 and game.away_team == team1:
            return game.away_points, game.home_points
    return None

load_dotenv()
key = os.getenv('API_KEY')
configuration = cfbd.Configuration()
configuration.api_key['Authorization'] = key
configuration.api_key_prefix['Authorization'] = 'Bearer'
api_instance = cfbd.ApiClient(configuration)

games_api = cfbd.GamesApi(api_instance)
games = games_api.get_games(year=2024, division='fbs', season_type='regular')

edges = []

for game in games:
    if game.completed:
        loser = get_loser(game)
        winner = get_winner(game)
        edges.append((loser, winner))
        scores = (get_loser_score(game), get_winner_score(game))

graph = nx.DiGraph(edges)

sccs = list(nx.strongly_connected_components(graph))
print(sccs)
largest_cycles = [[]]

for scc in sccs:
    subgraph = graph.subgraph(scc)
    for cycle in nx.simple_cycles(subgraph):
        if(len(cycle) == len(largest_cycles[0])):
            largest_cycles.append(cycle)
            print(f'new cycle found with length {len(cycle)}: \n{cycle}\n')
        if len(cycle) > len(largest_cycles[0]):
            largest_cycles.clear()
            largest_cycles.append(cycle)
            print(f'new largest cycle found with length {len(cycle)}: \n{cycle}\n')

teams_api = cfbd.TeamsApi(api_instance)
teams = teams_api.get_teams()
team_logos = {}

for team in teams:
    if team.logos is None:
        team_logos[team.school] = None
    else:
        team_logos[team.school] = team.logos[0]

largest_cycles = []
arr =['UTSA', 'Texas State', 'Arizona State', 'Texas Tech', 'Washington State', 'New Mexico', 'Arizona', 'Kansas State', 'BYU', 'Kansas', 'Illinois', 'Penn State', 'Ohio State', 'Michigan', 'Texas', 'Georgia', 'Alabama', 'Vanderbilt', 'Georgia State', 'Georgia Tech', 'Syracuse', 'Stanford', 'TCU', 'UCF', 'Colorado', 'Nebraska', 'UCLA', 'LSU', 'USC', 'Minnesota', 'North Carolina', 'James Madison', 'UL Monroe', 'South Alabama', 'North Texas', 'Memphis', 'Navy', 'Notre Dame', 'Northern Illinois', 'Buffalo', 'UConn', 'Maryland', 'Michigan State', 'Boston College', 'Virginia', 'Louisville', 'SMU', 'Clemson', 'South Carolina', 'Ole Miss', 'Kentucky', 'Florida', 'Tennessee', 'Arkansas', 'Oklahoma State', 'West Virginia', 'Baylor', 'Utah', 'Houston', 'Oklahoma', 'Missouri', 'Texas A&M', 'Auburn', 'California', 'NC State', 'Wake Forest', 'Louisiana', 'Marshall', 'Georgia Southern', 'Old Dominion', 'App State', 'Coastal Carolina', 'Troy', 'Nevada', 'Air Force', 'Wyoming', 'Colorado State', 'Oregon State', 'San José State', 'Fresno State', "Hawai'i", 'San Diego State', 'Utah State', 'Temple', 'East Carolina', 'Liberty', 'Kennesaw State', 'UTEP', 'Middle Tennessee', 'New Mexico State', 'Western Kentucky', 'Louisiana Tech', 'Tulsa', 'UAB', 'Charlotte', 'South Florida', 'Rice', 'Sam Houston', 'Jacksonville State', 'Eastern Michigan', 'Ohio', 'Miami (OH)', 'Toledo', 'Akron', 'Western Michigan', 'Central Michigan', 'Florida International', 'Florida Atlantic']
largest_cycles.append(arr)

with open('temp.txt', 'w') as out:
    for cycle in largest_cycles:
        for team in cycle:
            print(f'{team} vs {cycle[(cycle.index(team) + 1) % len(cycle)]}')
            scores = find_score(team, cycle[(cycle.index(team) + 1) % len(cycle)])
            out.write(f'["{team}", "{team_logos.get(team)}", {scores[0]}, {scores[1]}],\n')

        out.write('\n\n')

