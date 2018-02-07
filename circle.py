import json
import copy
from functools import reduce


class Graph(object):

    def __init__(self, data):
        if 'data' in data:
            data1 = data['data']
        else:
            data1 = data

        self.nodedata = data1
        self.namelist = []
        self.no = {}
        self.no2 = {}
        self.count = 0
        if 'nodes' in data1:
            for i in data1['nodes']:
                self.namelist.append(i['name'])
                self.no[i['name']] = self.count
                self.no2[self.count] = i['name']
                self.count = self.count + 1
        else:
            raise TypeError('illegal input!')

        self.linknum = []
        for i in range(self.count):
            self.linknum.append(0)

        self.linkmatrix = []
        for i in range(self.count):
            self.linkmatrix.append([])

        if 'links' in data1:
            for i in data1['links']:
                if not isinstance(i['source'], int):
                    p = self.no[i['source']]
                    q = self.no[i['target']]
                else:
                    p = i['source']
                    q = i['target']
                if q not in self.linkmatrix[p]:
                    self.linknum[p] = self.linknum[p] + 1
                    self.linkmatrix[p].append(q)
                    self.linknum[q] = self.linknum[q] + 1
                    self.linkmatrix[q].append(p)
        else:
            raise TypeError('illegal input!')
        self.useful = []
        self.used = []
        self.circle1 = []
        self.searched = []
        self.printed = []
        self.queue = []
        self.flag = 0
        self.maxlength = 0
        self.inacircle = []
        for i in range(self.count):
            self.inacircle.append(False)

    def get_nodes(self):
        return self.namelist

    def is_linked(self, node1, node2):
        if not isinstance(node1, int):
            node1 = self.no[node1]
            node2 = self.no[node2]
        if node2 in self.linkmatrix[node1]:
            return True
        else:
            return False

    def cut(self):
        self.useful = []
        for i in range(self.count):
            if self.linknum[i] > 1:
                self.useful.append(True)
            else:
                self.useful.append(False)
        flag = 1
        while flag:
            flag = 0
            for i in range(self.count):
                if self.useful[i]:
                    cnt = 0
                    for j in self.linkmatrix[i]:
                        if self.useful[j]:
                            cnt = cnt+1
                    if cnt <= 1:
                        flag = 1
                        self.useful[i] = 0
        cutted = []
        for i in range(self.count):
            if self.useful[i]:
                cutted.append(self.no2[i])
        return cutted

    def add_node(self, newdata):
        if 'nodes' in newdata:
            self.nodedata['nodes'] = self.nodedata['nodes'] + newdata['nodes']
            self.nodedata['nodes'] = reduce(lambda x, y: x if y in x else x + [y], [[], ] + self.nodedata['nodes'])

            for i in newdata['nodes']:
                if i['name'] not in self.namelist:
                    self.count = self.count + 1
                    self.namelist.append(i['name'])
                    self.no[i['name']] = self.count - 1
                    self.no2[self.count - 1] = i
                    self.linkmatrix.append([])
                    self.linknum.append(0)
                    self.inacircle.append(False)

        if 'links' in newdata:
            self.nodedata['links'] = self.nodedata['links'] + newdata['links']
            self.nodedata['links'] = reduce(lambda x, y: x if y in x else x + [y], [[], ] + self.nodedata['links'])
            for i in newdata['links']:
                if not isinstance(i['source'], int):
                    p = self.no[i['source']]
                    q = self.no[i['target']]
                else:
                    p = i['source']
                    q = i['target']
                if q not in self.linkmatrix[p]:
                    self.linknum[p] = self.linknum[p] + 1
                    self.linkmatrix[p].append(q)
                    self.linknum[q] = self.linknum[q] + 1
                    self.linkmatrix[q].append(p)

    def find_circle(self, pt1, tmp1, tmp2, circle, visited1, visited2, depth):
        if not self.useful[tmp1] or not self.useful[tmp2]:
            return
        self.used[pt1] = False
        self.circle1[depth] = copy.deepcopy(circle)
        if tmp1 not in self.circle1[depth] and tmp2 not in self.circle1[depth] and tmp1 != self.queue[0] and tmp2 != \
                self.queue[0] and tmp1 != tmp2:
            self.circle1[depth].add(tmp1)
            for ii in self.linkmatrix[tmp1]:
                if self.used[ii] and ([ii, tmp2, self.circle1[depth]]) not in self.searched and visited1[ii] == 0:
                    self.searched.append([ii, tmp2, self.circle1[depth]])
                    visited1[ii] = 1
                    self.find_circle(pt1, ii, tmp2, self.circle1[depth], visited1, visited2, depth + 1)
                    visited1[ii] = 0

            self.circle1[depth] = copy.deepcopy(circle)
            self.circle1[depth].add(tmp2)
            for jj in self.linkmatrix[tmp2]:
                if self.used[jj] and [tmp1, jj, self.circle1[depth]] not in self.searched and visited2[jj] == 0:
                    visited2[jj] = 1
                    self.searched.append([tmp1, jj, self.circle1[depth]])
                    self.find_circle(pt1, tmp1, jj, self.circle1[depth], visited1, visited2, depth + 1)
                    visited2[jj] = 0
            if tmp2 in self.circle1[depth]:
                self.circle1[depth] = ([])
            return
        elif tmp1 == tmp2:
            self.circle1[depth].add(tmp1)
        elif (tmp1 in circle and tmp1 != self.queue[0]) or (tmp2 in circle and tmp2 != self.queue[0]):
            self.circle1[depth] = set([])
            return
        elif tmp1 == self.queue[0]:
            self.circle1[depth].add(self.queue[0])
            self.circle1[depth].add(tmp2)
            for ii in self.linkmatrix[tmp2]:
                if self.used[ii] and [self.queue[0], ii, self.circle1[depth]] not in self.searched and visited2[
                    ii] == 0:
                    self.searched.append([self.queue[0], ii, self.circle1[depth]])
                    visited2[ii] = 1
                    self.find_circle(pt1, tmp1, ii, self.circle1[depth], visited1, visited2, depth + 1)
                    visited2[ii] = 0
            self.circle1[depth] = set([])
            return
        elif tmp2 == self.queue[0]:
            self.circle1[depth].add(self.queue[0])
            self.circle1[depth].add(tmp1)
            for ii in self.linkmatrix[tmp1]:
                if self.used[ii] and [ii, self.queue[0], self.circle1[depth]] not in self.searched and visited1[
                    ii] == 0:
                    self.searched.append([ii, self.queue[0], self.circle1[depth]])
                    visited1[ii] = 1
                    self.find_circle(pt1, ii, tmp2, self.circle1[depth], visited1, visited2, depth + 1)
                    visited1[ii] = 0
            self.circle1[depth] = set([])
            return

        s = self.circle1[depth]
        if s in self.printed:
            return
        if len(s) > self.maxlength:
            self.maxlength = len(s)
        for tmp in s:
            self.inacircle[tmp] = True
        self.printed.append(copy.deepcopy(s))
        self.circle1[depth] = set([])
        return

    def circle_in_graph(self):
        self.cut()
        i = 0
        while self.useful[i] == 0 and i < self.count:
            i = i + 1

        self.queue = [i]
        h, t = 0, 0
        father = []
        fathernum = []
        for i in range(self.count):
            father.append([])
            fathernum.append(0)

        self.circle1 = []
        for i in range(self.count):
            self.circle1.append(set([]))

        self.flag = 0
        for i in range(self.count):
            self.used.append(False)
        self.used[self.queue[0]] = True
        while h <= t:
            self.used[self.queue[h]] = True
            for i in self.linkmatrix[self.queue[h]]:
                if not self.useful[i] or i in father[self.queue[h]]:
                    continue
                if fathernum[i] == 0:
                    fathernum[i] = 1
                    father[i].append(self.queue[h])
                    t = t + 1
                    self.queue.append(i)
                    continue

                fathernum[i] = fathernum[i] + 1
                father[i].append(self.queue[h])
                for j in range(fathernum[i] - 1):
                    tmp1 = father[i][j]
                    tmp2 = father[i][fathernum[i] - 1]
                    visited1 = []
                    visited2 = []
                    for tmp in range(self.count):
                        visited1.append(0)
                        visited2.append(0)
                    visited1[tmp1] = 1
                    visited2[tmp2] = 1
                    self.find_circle(i, tmp1, tmp2, {i}, visited1, visited2, 0)
                    for tmp in range(self.count):
                        self.circle1[tmp] = []
                self.used[i] = True
                self.flag = 1
            h = h + 1
        return self.flag

    def has_a_circle(self, *nodes):
        visited1 = []
        visited2 = []
        for tmp in range(self.count):
            visited1.append(0)
            visited2.append(0)
        for ii in self.count:
            self.used[ii] = 0
        for ii in nodes:
            jj = self.no[ii]
            if not self.useful[jj]:
                return False
            self.used[jj] = 1
        for pp in nodes:
            ii = self.no[pp]
            self.used[ii] = 0
            tmp = []
            linkcount = 0
            for kk in self.count:
                visited1[kk] = 0
                visited2[kk] = 0
            for jj in self.linkmatrix[ii]:
                if self.no2[jj] in nodes:
                    linkcount = linkcount + 1
                    tmp.append(jj)
            if linkcount < 2:
                return False
            for p, q in tmp:
                if p != q:
                    visited1[p] = 1
                    visited2[q] = 1
                    self.find_circle(ii, p, q, [ii], visited1,visited2, 0)
                    if self.printed != []:
                        return True
        return False

    def print_as_json(self):
        datatoprint = []

        if self.flag == 1:
            for i in self.printed:
                tmp = []
                for j in i:
                    tmp.append(self.no2[j])
                datatoprint.append(tmp)
        else:
            datatoprint.append('No, circle!')
        with open('circleindata.json', 'w', encoding="utf-8") as f:
            json.dump(datatoprint, f)
        return

    def get_maxlen(self):
        return self.maxlength

    def get_useful_subgraph(self):
        usefuldata = {}
        nodes = []
        links = []
        new_no = {}
        for i in self.nodedata["nodes"]:
            if self.inacircle[self.no[i["name"]]]:
                nodes.append(i)
                new_no[i["name"]] = len(nodes) - 1
        usefuldata["nodes"] = nodes
        for i in self.nodedata["links"]:
            if self.inacircle[i["source"]] and self.inacircle[i["target"]]:
                links.append(
                    {"source": new_no[self.no2[i["source"]]], "target": new_no[self.no2[i["target"]]],
                     "relation": i["relation"],
                     "color": i["color"]})
        usefuldata["links"] = links
        return usefuldata


if __name__ == "__main__":
    data = open("json_test/sxi.cc.json", 'rb')
    data = json.load(data)
    graph1 = Graph(data)
    graph1.circle_in_graph()
    graph1.print_as_json()
