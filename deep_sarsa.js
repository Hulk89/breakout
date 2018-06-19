function makeInput(data, width, height) {
    var input = tf.tensor3d(data, [2, height, width])
    var transposed = tf.transpose(input, [2,1,0])
    var expanded = transposed.expandDims(axis=0)
    input.dispose()
    transposed.dispose()
    return expanded
}

function make_model(lr, width, height) {
    const model = tf.sequential();
    model.add(tf.layers.conv2d({
        inputShape: [width, height, 2],
        activation: 'relu',
        kernelInitializer: 'varianceScaling',
        kernelSize: 5,
        strides: 1,
        filters: 8
    }));
    model.add(tf.layers.flatten())
    model.add(tf.layers.dense({
        units: 128,
        activation: 'relu',
        kernelInitializer: 'varianceScaling'
    }));
    model.add(tf.layers.dense({
        units:2,
        kernelInitializer: 'VarianceScaling', 
        activation: 'linear'
    }))
    model.compile({loss: 'meanSquaredError', optimizer: tf.train.adam(lr)});
    return model
}


class DeepSarsaAgent {
    constructor(width, height) {
        this.discount_factor = 0.9
        this.learning_rate = 0.001
        
        this.epsilon_decay = 0.9999
        this.epsilon_min = 0.01
        this.epsilon = 1.0
        //////////////make model////////////////
        this.width = width
        this.height = height
        this.model = make_model(this.learning_rate, this.width, this.height)
        ////////////////////////////////////////
        this.num_frame = 0
    }

    async get_action(state) {
        if (Math.random() <= this.epsilon) {
            return this.get_random_action()
        }
        else {
            var input_data = makeInput(state, 40, 50)
            var result = this.model.predict(input_data);
            
            var action = (await result.argMax(1).data())[0]
            
            input_data.dispose()
            result.dispose()
            return action
        }
    }
    async get_actions(state) {
        if (Math.random() <= this.epsilon) {
            var actions = [0,0]
            actions[this.get_random_action()] = 1
            return {type: "random", actions: actions}
        }
        else {
            var input_data = makeInput(state, 40, 50)
            var result = this.model.predict(input_data);
            
            var actions = (await result.data())  //Float32 Array with 4
            actions = Array.from(actions);
            actions = softmax(actions, 0.1)
            
            input_data.dispose()
            result.dispose()
            return {type: "network_output", actions: actions}
        }
    }
    async train_model(state, action, reward, next_state, next_action, done) {
        if (this.epsilon > this.epsilon_min) {
            this.epsilon *= this.epsilon_decay
        }

        state = makeInput(state, 40, 50)
        next_state = makeInput(next_state, 40, 50)

        var target = this.model.predict(state)
        var target_val = this.model.predict(next_state)
        
        var q_res = await target.data()
        var target_reward = (await target_val.data())
        target_reward = target_reward[next_action]
        if (done){
            q_res[action] = reward
        }
        else {
            q_res[action] = reward + this.discount_factor * target_reward
        }
        
        // q의 value update
        var res = Array.from(q_res);
        var q = tf.tensor2d(res, [1, 2])
        
        const h = await this.model.fit(state, q, {epoch: 1})
        
        this.num_frame += 1
        if (this.num_frame % 100 == 0) {
            log_area.innerHTML += "loss: " + h.history.loss[0] + "\n"
            log_area.scrollTop = log_area.scrollHeight;    
        }
        state.dispose()
        next_state.dispose()
        target.dispose()
        target_val.dispose()
        q.dispose()
        
    }
    get_random_action() {
        var i = Math.random()
        if (i < 0.5) {
            return 0
        }else {
            return 1
        }
    }
}

  
async function train(agent) {
    var env = new Environment()
    var data = env.data
    var num_ep = 5000;
  
    for (var i_ep=0; i_ep < num_ep ; i_ep++){
      env.initializeGame();
      data = env.data
      var state = [arrayClone(data), arrayClone(data)]
      var action, res
      var next_state;
      var done = false;
      var reward = 0;
      var score = 0;
  
      while (!done) {
        action = await agent.get_action(state)
        res = env.step(translateAction(action))
        data   = res["state"]
        reward = res["reward"]
        done   = res["done"]
        
        next_state = [state[1], arrayClone(data)]
        next_action = await agent.get_action(next_state)
  
        await agent.train_model(state, action, reward, next_state, next_action, done)
        
        state = next_state
        score += reward

        await tf.nextFrame();
      }
      
      log_area.innerHTML += i_ep + "th episode ended. score: " + score.toFixed(3) + "\n"
      log_area.scrollTop = log_area.scrollHeight;
    }
    //save_result = await model.save('localstorage://my-model');
  }
  
