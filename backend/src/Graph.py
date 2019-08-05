import numpy as np
import pandas as pd
import json
from tulip import tlp
import random
import numpy as np
from sklearn.manifold import TSNE

class Graph:
    def __init__(self, path = '../data/all.json'):
        print('start init')
        data = json.load(open(path, 'r'))
        self.nodes = data['nodes']
        self.links = data['links']
        self.embData = np.loadtxt("./data/emb.csv",delimiter=",", skiprows=1)
        # self.emb = emb

    def getLayout(self, chooseList = []):
        # return {'nodes': self.nodes, 'links': self.links}
        # print(choo)
        if(chooseList == []):
            chooseList = np.arange(len(self.nodes))
        
        graph = tlp.newGraph()

        nodeListOld = {}
        for i, item in enumerate(chooseList):
            nodeListOld[item] = i
        linkList = []
        nodeList = {}
        duList = {}
        tot = 0
        for item in self.links:
            if(nodeListOld.__contains__(item['source']) or nodeListOld.__contains__(item['target'])):
                linkList.append(item)
                if(nodeList.__contains__(item['source']) == False):
                    nodeList[item['source']] = tot
                    duList[item['source']] = 0
                    tot += 1
                if(nodeList.__contains__(item['target']) == False):
                    nodeList[item['target']] = tot
                    duList[item['target']] = 0
                    tot += 1
                duList[item['source']] |= 1
                duList[item['target']] |= 2

        nodes = graph.addNodes(len(nodeList))
        edgeData = []
        for item in linkList:
            edgeData.append((nodes[nodeList[item['source']]], nodes[nodeList[item['target']]]))
        
        graph.addEdges(edgeData)
        viewLayout = graph.getLayoutProperty("viewLayout")
        LayoutName = 'Random layout'
        LayoutParams = tlp.getDefaultPluginParameters(LayoutName, graph)
        graph.applyLayoutAlgorithm(LayoutName, viewLayout, LayoutParams)
        print("Graph Initalized!")
        LayoutName = 'FM^3 (OGDF)'
        LayoutParams = tlp.getDefaultPluginParameters(LayoutName, graph)
        print ('Nodes number:', len(nodes))
        graph.applyLayoutAlgorithm(LayoutName, viewLayout, LayoutParams)
        
        
        coords = [viewLayout.getNodeValue(n) for n in nodes]
        nodeResult = []
        for item in nodeList:
            tmpNode = self.nodes[item].copy()
            tmpNode.update({'x': coords[nodeList[item]][0], 'y': coords[nodeList[item]][1], 'du': duList[item]})
            nodeResult.append(tmpNode)
        print("Layout Finished!")

        linksResult = []
        for i in range(len(linkList)):
            tmpNode = linkList[i].copy()
            tmpNode.update({
                'source': { 'x': coords[nodeList[tmpNode['source']]][0], 'y': coords[nodeList[tmpNode['source']]][1]},
                'target': { 'x': coords[nodeList[tmpNode['target']]][0], 'y': coords[nodeList[tmpNode['target']]][1]}
            })
            linksResult.append(tmpNode)        

        return {'nodes': nodeResult, 'links': linksResult}

    
    def getDimension(self):
        # print('start TNSE')
        # emb = self.emb
        # tsne = TSNE(perplexity=30, n_components=2, n_iter=1000, verbose = 1)
        # low_emb = tsne.fit_transform(emb)
        # print()
        result = []
        du = np.zeros(len(self.nodes)).astype(np.int32)
        
        for i in range(len(self.links)):
            du[self.links[i]['source']] += 1
            du[self.links[i]['target']] -= 1

        countList = {}
        for item in du:
            if(countList.__contains__(item) == False):
                countList[int(item)] = 0
            countList[int(item)] += 1

        # print(countList)
        # sortDu = np.sort(np.unique(du))
        # for i in range(len(du)):
        #     du[i] = np.searchsorted(sortDu, du[i])

        # print(np.max(du), np.min(du))
        for i in range(len(self.nodes)):
            if(i % 2 == 0):
                continue
            # tmpX = random.uniform(0, 1)
            # tmpY = random.uniform(0, 1)
            tmpX = float(self.embData[i][0])
            tmpY = float(self.embData[i][1])
            result.append({'positionX': tmpX, 'positionY': tmpY, 'key': i, 'du': int(du[i])})

        for i in range(len(self.nodes)):
            if(i % 2 == 1):
                continue
            # tmpX = random.uniform(0, 1)
            # tmpY = random.uniform(0, 1)
            tmpX = float(self.embData[i][0])
            tmpY = float(self.embData[i][1])
            result.append({'positionX': tmpX, 'positionY': tmpY, 'key': i, 'du': int(du[i])})

        return result

    def getAll(self):
        return {'layout': self.getLayout(), 'dimension': self.getDimension()}



