import numpy as np
from game_object import *


class Environment:
    def __init__(self):
        self.width = 40
        self.height = 50
        self.bar_length = 10
        self.bar_h = self.height - 4
        self.data = np.zeros((self.height, self.width), dtype=int)
        self.initializeGame()
    
    def initializeGame(self):
        self.initializeDisplay()

        self.ball = Ball(int(self.width/4 + random.random() * self.width/2),
                         int(self.height/2),
                         3)
        bar_pos = int((self.width - self.bar_length)/2)
        self.bar = Bar(bar_pos, self.bar_h, self.bar_length, 1)
        
    
        row = 3
        col = 8
        self.bars = [Bar(4 + 4 * i, 8 + 4* j, 3, 2) 
                        for j in range(row) 
                            for i in range(col)]
        self.objectsToData()
        self.end = False
        self.gameover_reward = -3
        self.finish_reward = 3

    def initializeDisplay(self):
        for i in range(self.width):
            for j in range(self.height):
                self.data[j][i] = 0

        for i in range(self.width):
            self.data[0][i] = 1
            self.data[self.height-1][i] = 1
        for j in range(self.height):
            self.data[j][0] = 1
            self.data[j][self.width-1] = 1
    
    def objectToData(self, obj):
        possession = obj.getPossession()
        for p in possession["pos"]:
            self.data[p[1]][p[0]] = possession["color"]
    
    def objectsToData(self):
        self.initializeDisplay()
        self.objectToData(self.ball)
        self.objectToData(self.bar)
        for bar in self.bars:
            self.objectToData(bar)
    
    def collisionCheckWithColor(self):
        pos = self.ball.getPos()
        collMap = [[-1, -1], [0, -1], [1, -1], [-1, 0], 
                   [1,   0], [-1, 1], [0,  1], [1,  1]]
        for i in range(8):
            self.ball.collision[i] = self.data[pos[1] + collMap[i][1]][pos[0] + collMap[i][0]]
        
    def removeBars(self, break_pos):
        # 바가 맞았으면 true를 return, 아니면 false 리턴
        x, y = break_pos

        for i, bar in enumerate(self.bars):
            possessions = bar.getPossession()

            for pos in possessions["pos"]:
                if pos[0] == x and pos[1] == y:
                    del self.bars[i]
                    return True
        return False
    
    def next_state(self):
        pos = self.ball.getPos()

        if not self.bars:
            print("game clear")
            self.end = True
            return self.finish_reward
        elif pos[1] >= self.height-2:
            print("game over")
            self.end = True
            return self.gameover_reward
        
        self.ball.setCollisionZero()
        self.collisionCheckWithColor()
        poss = self.ball.getCollisionPositions()

        reward = 0

        for pos in poss:
            removed = self.removeBars(pos)
            if removed:
                reward = reward + 1
        
        self.ball.applyDirectionWithCollision()

        self.ball.setNewPosition()
        self.bar.setNewPosition(self.width)

        self.objectsToData()

        return reward

    def step(self, action):
        self.bar.action = action
        reward = self.next_state()

        return {"reward": reward,
                "state":  self.data,
                "done":   self.end}

if __name__ == '__main__':
    from PIL import Image
    import time
    import psutil
    def rendering(data):
        np_img = data * 64
        img = Image.fromarray(np.uint8(np_img))
        return img

    env = Environment()
    env.objectsToData()

    for i in range(100):
        img = rendering(env.data)
        img.show()
        env.next_state()
        time.sleep(0.1)



    