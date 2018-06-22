import math
import random

class GameObject:
    def __init__(self, x, y, color_idx):
        self.x = x
        self.y = y
        self.color_idx = color_idx

    def getPossession(self):
        return {"pos":   [self.getPos()], 
                "color":  self.color_idx}
    
    def getPos(self):
        return [self.x, self.y]
    
    def setPos(self, x, y):
        self.x = x
        self.y = y

class Ball(GameObject):
    def __init__(self, x, y, color_idx):
        super(self.__class__, self).__init__(x, y, color_idx)
        self.directions =  {"up_left":    [-1, -1],
                            "down_left":  [-1, 1],
                            "up_right":   [1,-1], 
                            "down_right": [1, 1]}
        if random.random() < 0.5:
            self.direction = "down_right"
        else:
            self.direction = "down_left"
        self.collision = [0,0,0,0,0,0,0,0]

    def setCollisionZero(self):
        self.collision = [0,0,0,0,0,0,0,0]
    
    def getCollisionPositions(self):
        ##방향에 따라 부딪힐 수 있는 모들 곳을 return
        pos = self.getPos()
        new_pos = self.getNewPosition()

        if (self.direction == "up_right"):
            return [[pos[0]+1, pos[1]],
                    [pos[0], pos[1]-1],
                    new_pos]
        elif (self.direction == "up_left"):
            return [[pos[0]-1, pos[1]],
                    [pos[0], pos[1]-1],
                    new_pos]
        elif (self.direction == "down_left"):
            return [[pos[0]-1, pos[1]],
                    [pos[0], pos[1]+1],
                     new_pos]
        else:
            return [[pos[0]+1, pos[1]],
              [pos[0], pos[1]+1],
              new_pos]
    
    def getNewPosition(self):
        pos = self.getPos()
        dpos = self.directions[self.direction]
        new_pos = [pos[0] + dpos[0], pos[1] + dpos[1]]
        return new_pos
    
    def setNewPosition(self):
        new_pos = self.getNewPosition()
        self.setPos(new_pos[0], new_pos[1])
    
    def applyDirectionWithCollision(self):
        coll = self.collision

        if self.direction == "up_right":
            if coll[1] and coll[4]:
                self.direction = "down_left"
            elif coll[2] and (not coll[1]) and (not coll[4]):
                self.direction = "down_left"
            elif coll[1]:
                self.direction = "down_right"
            elif coll[4]:
                self.direction = "up_left"
        elif self.direction == "up_left":
            if coll[1] and coll[3]:
                self.direction = "down_right"
            elif coll[0] and (not coll[1]) and (not coll[3]):
                self.direction = "down_right"
            elif coll[1]:
                self.direction = "down_left"
            elif coll[3]:
                self.direction = "up_right"
        elif self.direction == "down_left":
            if (coll[6] and coll[3]):
                self.direction = "up_right"
            elif (coll[5] and (not coll[3]) and (not coll[6])):
                self.direction = "up_right"
            elif (coll[6]):
                self.direction = "up_left"
            elif (coll[3]):
                self.direction = "down_right"
        else:
            if (coll[6] and coll[4]):
                self.direction = "up_left"
            elif (coll[7] and (not coll[6]) and (not coll[4])):
                self.direction = "up_left"
            elif (coll[6]):
                self.direction = "up_right"
            elif (coll[4]):
                self.direction = "down_left"

class Bar(GameObject):
    def __init__(self, x, y, length, color_idx):
        super().__init__(x, y, color_idx)
        self.length = length
        self.action = "right"
    
    def getPossession(self):
        pos = [[self.x+i, self.y] 
                    for i in range(self.length)]
        return {"pos": pos, "color": self.color_idx}
    def setNewPosition(self, width):
        pos = self.getPos()
        if self.action == "right":
            new_pos = [min(pos[0]+1, width - self.length), pos[1]]
        else:
            new_pos = [max(0, pos[0]-1), pos[1]]
        self.setPos(new_pos[0], new_pos[1])
