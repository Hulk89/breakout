
function zeros2D(rows, cols) {
  var array = [], row = [];
  while (cols--) row.push(0);
  while (rows--) array.push(row.slice());
  return array;
}

class Environment {
  constructor() {
    this.width = 40;
    this.height = 50;
    this.bar_length = 10;
    this.bar_h = this.height - 4
    this.data = zeros2D(this.height, this.width)
    this.initializeGame()
  }

  initialize_display() {
    for( var i=0 ; i < this.width ; i++) {
      for( var j=0 ; j < this.height ; j++) {
        this.data[j][i] = 0
      }
    }
    for (var i = 0 ; i < this.width ; i++) {
      this.data[0][i] = 1
      this.data[this.height-1][i] = 1
    }
    for (var i = 0 ; i < this.height ; i++) {
      this.data[i][0] = 1
      this.data[i][this.width-1] = 1
    }
  }
  initializeGame() {
    this.initialize_display()

    this.ball = new Ball(parseInt(this.width/4 + Math.random()*this.width/2),
                         this.height/2,//this.bar_h,
                         3)
    const bar_pos = parseInt((this.width-this.bar_length)/2)
    this.bar = new Bar(bar_pos, this.bar_h, this.bar_length, 1)
    this.bars = []
    
    const row = 3
    const col = 8
    for (var j = 0 ; j < row ; j++) {
      for (var i = 0 ; i < col ; i++) {
        var bar = new Bar(4 + 4 * i, 8 + 4 * j, 3, 2)
        this.bars.push(bar)
      }
    }
    this.objectsToData()
    this.end = false
    this.gameover_reward = -3
    this.finish_reward = 3
  }
  
  objectToData(obj) {
    var possession = obj.getPossession()

    possession.pos.forEach(e => {
      this.data[e[1]][e[0]] = possession.color
    });

  }
  objectsToData() {
    this.initialize_display()

    this.objectToData(this.ball)
    this.objectToData(this.bar)
    this.bars.forEach( e => {
      this.objectToData(e)
    })
  }

  collision_check_with_color() {
    var pos = this.ball.getPos()
    var collMap = [[-1, -1], [0, -1], [1, -1], [-1, 0],  [1, 0], [-1, 1], [0, 1], [1, 1],]
    for (var i = 0 ; i < 8 ; i++) {
      this.ball.collision[i] = this.data[pos[1] + collMap[i][1]][pos[0] + collMap[i][0]]
    }
  }


  remove_bars(break_pos) {
    // 바가 맞았으면 true를 return, 아니면 false 리턴
    var x = break_pos[0]
    var y = break_pos[1]

    for (var i=0; i< this.bars.length ; i++) {
      var possessions = this.bars[i].getPossession()
      
      for (var j=0 ; j < possessions.pos.length ; j++) {
        var e = possessions.pos[j]
        if (e[0] == x && e[1] == y) {
          this.bars.splice(i, 1)
          return true
        }
      }
    }
    return false
  }

  next_state() {
    /* game end 조건 */
    var pos = this.ball.getPos()
    if (this.bars.length == 0) {
      console.log("Game clear")
      this.end = true;
      return this.finish_reward
    }
    if (pos[1] >= this.height-2) {
      console.log("GameOver");
      this.end = true;
      return this.gameover_reward
    }

    /* ball 이동을 위한 충돌체크*/
    
    this.ball.set_collision_zero()
    this.collision_check_with_color()
    var poss = this.ball.get_collision_positions()
    
    
    /* bar 지우기 + reward 주기 */  
    var reward = 0
    
    for (var i=0 ; i < poss.length ; i++) {
      var removed = this.remove_bars(poss[i])
      if (removed == true) {
        reward = reward + 1
      }
    }
    
    /* ball direction 조정 */
    this.ball.apply_direction_with_collision()
    
    /* ball 위치 이동 */
    this.ball.set_new_position()
    this.bar.set_new_position(this.width)

    /* rendering */
    this.objectsToData()
    
    return reward
  }

  next_state_for_agent(action) {
    // action: right, left

    this.bar.action = action
    
    var reward = this.next_state()
    /* return next_state */
    return {"reward": reward, 
            "state": this.data,
            "done": this.end}  
  }
}

