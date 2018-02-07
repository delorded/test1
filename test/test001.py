import json
import circle

data = open("json_test/autobicycle.20x.cc.json", 'rb')
data = json.load(data)
graph1 = circle.Graph(data)
graph1.quick_get_useful_subgraph()
with open('useful_subgraph_bicycle.json', 'w', encoding="utf-8") as f:
        json.dump(graph1.get_useful_subgraph(), f)



