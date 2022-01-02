async function checkIsLiked(uid, arr) {
    const yes = arr.some((item) => {
        let a = String(item._id);
        let b = uid;
        return String(item._id) === String(uid);
    });
    return yes;
}

exports.extractPost = (id, data) => {
    let arr = [];
    data.Posts.forEach((post) => {
        checkIsLiked(id, post.Likes).then((res) => {
            post.isAuth = true;
            post.isLiked = res;
            arr.push(post);
        });
    });
    data.Friends.forEach((friend) => {
        //console.log(friend);
        const tempArr = friend.Posts;
        tempArr.forEach((post) => {
            checkIsLiked(id, post.Likes).then((res) => {
                post.isAuth = false;
                post.isLiked = res;
                arr.push(post);
            });
        });
        //arr.push(...friend.Posts);
    });

    return arr;
};

exports.extractProfilePost = async (id, data) => {
    const arr = [];
    const isUserProfile = String(id) === String(data._id);

    data.receivedPosts.forEach((post) => {
        checkIsLiked(id, post.Likes).then((res) => {
            if (String(id) === String(post.Author._id)) {
                post.isAuth = true;
            } else {
                post.isAuth = isUserProfile;
            }
            post.isLiked = res;
            arr.push(post);
        });
    });
    data.Posts.forEach((post) => {
        checkIsLiked(id, post.Likes).then((res) => {
            if (String(id) === String(post.Author._id)) {
                post.isAuth = true;
            } else {
                post.isAuth = isUserProfile;
            }
            post.isLiked = res;
            arr.push(post);
        });
    });
    return arr;
};

exports.sortPosts = async (arr) => {
    return arr.sort(function (a, b) {
        return Date.parse(b.Timestamp) - Date.parse(a.Timestamp);
    });
};

exports.returnPagePosts = async (arr, page, limit) => {
    //return arr.slice((page - 1) * limit, page * limit); // one page
    return arr.slice(0, page * limit); // pages
};
