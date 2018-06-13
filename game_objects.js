class GameObject {
  constructor(x, y, color_idx) {
    this.x = x;
    this.y = y;
    this.color_idx = color_idx;
  }

  getPossession() {
    return {pos: [this.getPos()], color: this.color_idx}
  }
  getPos() {
    return [this.x, this.y]
  }
  setPos(x, y) {
    this.x = x;
    this.y = y;
  }
}
  
class Ball extends GameObject {
  constructor(x, y, color_idx) {
    super(x, y, color_idx)
    this.directions = {"up_left":    [-1, -1],
                       "down_left":  [-1, 1],
                       "up_right":   [1,-1], 
                       "down_right": [1, 1]}
    
    if (Math.random() < 0.5) {
      this.direction = "down_right"
    }
    else {
      this.direction = "down_left"
    }
      
    
    this.collision = [0,0,0,0, 0,0,0,0];
  }

  set_collision_zero() {
    this.collision = [0,0,0,0, 0,0,0,0];
  }

  get_collision_positions() {
    // 방향에 따라 부딪힐 수 있는 모들 곳을 return
    var pos = this.getPos()
    var new_pos = this.get_new_position()

    if (this.direction == "up_right") {
      return [[pos[0]+1, pos[1]],
              [pos[0], pos[1]-1],
              new_pos]
    }
    else if (this.direction == "up_left") {
      return [[pos[0]-1, pos[1]],
              [pos[0], pos[1]-1],
              new_pos]
    }
    else if (this.direction == "down_left") {
      return [[pos[0]-1, pos[1]],
              [pos[0], pos[1]+1],
              new_pos]
    }
    else {
      return [[pos[0]+1, pos[1]],
              [pos[0], pos[1]+1],
              new_pos]
    }
  }
  
  get_new_position() {
    // 현재 방향의 새로운 position을 반환
    var pos = this.getPos()
    var dpos = this.directions[this.direction]
    var new_pos = [pos[0]+dpos[0], pos[1]+dpos[1]]
    return new_pos;
  }
  
  set_new_position() {
    // 새로운 포지션으로 update
    var new_pos = this.get_new_position()
    this.setPos(new_pos[0], new_pos[1])
  }

  apply_direction_with_collision() {
    var coll = this.collision
    if (this.direction == "up_right") {
      if (coll[1] && coll[4]) {
        this.direction = "down_left"
      }
      else if (coll[2] && !coll[1] && !coll[4]) {
        this.direction = "down_left"
      }
      else if (coll[1]) {
        this.direction = "down_right"
      }
      else if (coll[4]) {
        this.direction = "up_left"
      }
    }
    else if (this.direction == "up_left") {
      if (coll[1] && coll[3]) {
        this.direction = "down_right"
      }
      else if (coll[0] && !coll[1] && !coll[3]) {
        this.direction = "down_right"
      }
      else if (coll[1]) {
        this.direction = "down_left"
      }
      else if (coll[3]) {
        this.direction = "up_right"
      }
    }
    else if (this.direction == "down_left") {
      if (coll[6] && coll[3]) {
        this.direction = "up_right"
      }
      else if (coll[5] && !coll[3] && !coll[6]) {
        this.direction = "up_right"
      }
      else if (coll[6]) {
        this.direction = "up_left"
      }
      else if (coll[3]) {
        this.direction = "down_right"
      }
    }
    else { //down_right
      if (coll[6] && coll[4]) {
        this.direction = "up_left"
      }
      else if (coll[7] && !coll[6] && !coll[4]) {
        this.direction = "up_left"
      }
      else if (coll[6]) {
        this.direction = "up_right"
      }
      else if (coll[4]) {
        this.direction = "down_left"
      }
    }
  }
}

class Bar extends GameObject{
  constructor(x, y, length, color_idx) {
    super(x, y, color_idx)
    this.length = length;
    this.action = "right"
  }

  getPossession() {
    var pos = []
    for (var i=0;i<this.length;i++) {
      pos.push([this.x + i, this.y])
    }
    return {pos: pos, color: this.color_idx}
  }

  set_new_position(width) {
    var pos = this.getPos()
    var new_pos;
    if (this.action == "right") {
      new_pos = [Math.min(pos[0]+1, width - this.length), pos[1]]
    }
    if (this.action == "left") {
      new_pos = [Math.max(0, pos[0]-1), pos[1]]
    }
    this.setPos(new_pos[0], new_pos[1])
  }
}
