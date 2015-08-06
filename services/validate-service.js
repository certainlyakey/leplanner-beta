exports.validate = function(to_validate_array, next){

  if(typeof to_validate_array == 'undefined' || to_validate_array.length === 0){
    return next({error: 'Validation array undefined'});
  }

  var validation = {
    userData: userData,
    password: password,
    email: email,
    passwordUpdate: passwordUpdate,
    passwordReset: passwordReset,
    addRemoveFollow: addRemoveFollow,
    commentData: commentData,
    deleteComment: deleteComment,
    addRemoveFavorite: addRemoveFavorite,
  };

  for(var i = 0; i < to_validate_array.length; i++){
    var fn = to_validate_array[i].fn.toString();
    var data = to_validate_array[i].data;
    if(typeof validation[fn] != 'undefined'){
      validation[fn](data);
    }
  }

  // VALIDATION FUNCTIONS
  function userData(user){

    // prevalidate user input before db, if html validation fails
    if(!user.new_first_name){ return next({id: 0, message: 'Please enter your first name'}); }
    if(!user.new_last_name){ return next({id: 1, message: 'Please enter your last name'}); }
    if(!user.new_email){ return next({id: 2, message: 'Please enter your email'}); }
    if(user.new_email.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/) === null){
      return next({id: 3, message: 'Please enter correct email'});
    }

    next();
  }

  function password(user_password){
    if(!user_password){ return next({id: 4, message: 'Please enter your password'}); }
    if(user_password.length < 8){ return next({id: 5, message: 'Password has to be min 8 chars long'}); }

    next();
  }

  function passwordUpdate(user){
    if(!user.password || !user.new_password || !user.new_password_twice){ return next({id: 7, message: 'Please enter all fields'}); }
    if(user.password.length < 8 || user.new_password.length < 8 || user.new_password_twice.length < 8){ return next({id: 5, message: 'Password has to be min 8 chars long'}); }
    if(user.password == user.new_password){ return next({id: 8, message: 'New password has to be different from old one'}); }
    if(user.new_password != user.new_password_twice){ return next({id: 9, message: 'New passwords dont match'}); }

    next();
  }

  function passwordReset(user){
    if(!user.new_password || !user.new_password_twice){ return next({id: 7, message: 'Please enter all fields'}); }
    if(user.new_password.length < 8 || user.new_password_twice.length < 8){ return next({id: 5, message: 'Password has to be min 8 chars long'}); }
    if(user.new_password != user.new_password_twice){ return next({id: 9, message: 'New passwords dont match'}); }

    next();
  }

  function email(user_email){
    if(user_email.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/) === null){
      return next({id: 3, message: 'Please enter correct email'});
    }

    next();
  }

  function addRemoveFollow(params) {
    if(typeof params === 'undefined'){return next('no params sent');}
    if(params.user._id == params.following._id){ return next("can not follow yourself");}
    if(!params.user._id){return next("no user data sent");}
    if(!params.following._id){return next("to follow/unfollow not sent");}

    next();
  }

  function commentData(params) {
    if(!params.comment.text){ return next({id: 0, message: 'Comment can not be empty'}); }
    if(!params.user._id){ return next({id: 1, message: 'User id missing'}); }
    if(!params.scenario._id){ return next({id: 2, message: 'Scenario id missing'}); }
    if(!params.author._id){ return next({id: 3, message: 'Scenario author id missing'}); }

    next();
  }

  function deleteComment(params) {
    if(!params.comment._id){ return next({id: 0, message: 'Comment id missing'}); }
    if(!params.user._id){ return next({id: 1, message: 'User id missing'}); }
    if(!params.scenario._id){ return next({id: 2, message: 'Scenario id missing'}); }

    next();
  }

  function addRemoveFavorite(params){
    if(!params.user._id){ return next({id: 1, message: 'User id missing'}); }
    if(!params.scenario_id){ return next({id: 2, message: 'Scenario id missing'}); }

    next();
  }

};