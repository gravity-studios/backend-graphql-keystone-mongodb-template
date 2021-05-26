// Access control functions
const isAdmin = ({ authentication: { item: user } }) =>
    Boolean(user && user.isAdmin);

const isUser = ({ authentication: { item: user } }) => {
    if (!user) {
        return false;
    }

    return { id: user.id };
};

const ownsItemViaUser = async ({ authentication: { item: user } }) => {
    if (!user) {
        return false;
    }

    return { user: { id: user.id } };
};

const isAdminOrUser = (auth) => isAdmin(auth) || isUser(auth);

const isAdminOrOwner = async (auth) => isAdmin(auth) || ownsItemViaUser(auth);

module.exports = {
    isUser,
    isAdmin,
    ownsItemViaUser,
    isAdminOrOwner,
    isAdminOrUser,
};
