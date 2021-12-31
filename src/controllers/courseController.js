const httpStatus = require("http-status");
const jwt = require("jsonwebtoken");
const config = require("./../config/jwt.config");

const db = require("../models");
const constants = require("../config/constants.config");

const Course = db.courses;
const User = db.users;
const Question = db.questions;
const Answer = db.answers;
const UserCourse = db.userCourses;

// 1. Add Course
// instructor or admin accounts
const addCourse = async (req, res) => {
    jwt.verify(req.token, config.SECRET_KEY, async (err, authData) => {
        if (err) {
            return res.status(httpStatus.UNAUTHORIZED).send({
                message: err.message,
            });
        } else {
            const user = await User.findOne({
                where: {
                    username: authData.username,
                },
            });

            if (user) {
                if (
                    user.type == constants.userType.ADMIN ||
                    user.type == constants.userType.INSTRUCTOR
                ) {
                    // Do Your function

                    const info = {
                        name: req.body.name,
                        syllabus: req.body.syllabus,
                        instructorId: authData._id,
                    };
                    try {
                        const course = await Course.create(info);
                        return res.status(httpStatus.OK).send(course);
                    } catch (error) {
                        return res.status(httpStatus.FORBIDDEN).send({
                            message: "Duplicate course name",
                        });
                    }
                } else {
                    return res.status(httpStatus.UNAUTHORIZED).send({
                        message:
                            "you must be an admin or instructor to do this operation ",
                    });
                }
            } else {
                return res.status(httpStatus.NOT_FOUND).send({
                    message: "user Not Found",
                });
            }
        }
    });
};

const addQuestion = async (req, res) => {
    jwt.verify(req.token, config.SECRET_KEY, async (err, authData) => {
        if (err) {
            return res.status(httpStatus.UNAUTHORIZED).send({
                message: err.message,
            });
        } else {
            const user = await User.findOne({
                where: {
                    username: authData.username,
                },
            });

            if (user == null) {
                return res.status(httpStatus.NOT_FOUND).send({
                    message: "user Not Found",
                });
            }

            const course = await Course.findOne({
                where: {
                    _id: req.params.id,
                },
            });

            if (course == null) {
                return res.status(httpStatus.NOT_FOUND).send({
                    message: "course Not Found",
                });
            }

            const info = {
                username: authData.username,
                courseId: req.params.id,
                body: req.body.question,
                date: req.body.date,
            };

            try {
                const question = await Question.create(info);
                return res.status(httpStatus.OK).send(question);
            } catch (error) {
                return res.status(httpStatus.FORBIDDEN).send({
                    message: "invalid question, please try again",
                });
            }
        }
    });
};

const addAnswer = async (req, res) => {
    jwt.verify(req.token, config.SECRET_KEY, async (err, authData) => {
        if (err) {
            return res.status(httpStatus.UNAUTHORIZED).send({
                message: err.message,
            });
        } else {
            const user = await User.findOne({
                where: {
                    username: authData.username,
                },
            });

            if (user == null) {
                return res.status(httpStatus.NOT_FOUND).send({
                    message: "user Not Found",
                });
            }

            const question = await Question.findOne({
                where: {
                    _id: req.params.id,
                },
            });

            if (question == null) {
                return res.status(httpStatus.NOT_FOUND).send({
                    message: "question Not Found",
                });
            }

            const info = {
                username: authData.username,
                questionId: req.params.id,
                body: req.body.answer,
                date: req.body.date,
            };

            try {
                const answer = await Answer.create(info);
                return res.status(httpStatus.OK).send(answer);
            } catch (error) {
                console.log(error);
                return res.status(httpStatus.FORBIDDEN).send({
                    message: "invalid answer, please try again",
                });
            }
        }
    });
};

// 2. Get Courses
// any authorized user
const getCourse = async (req, res) => {
    jwt.verify(req.token, config.SECRET_KEY, async (err, authData) => {
        if (err) {
            return res.status(httpStatus.UNAUTHORIZED).send({
                message: err.message,
            });
        } else {
            const course = await Course.findOne({
                where: {
                    _id: req.params.id,
                },
            });

            if (course) {
                return res.status(httpStatus.OK).send(course);
            } else {
                return res.status(httpStatus.NOT_FOUND).send({
                    message: "Course Not Found",
                });
            }
        }
    });
};

// any authorized user
const getCourses = async (req, res) => {
    jwt.verify(req.token, config.SECRET_KEY, async (err, authData) => {
        if (err) {
            return res.status(httpStatus.UNAUTHORIZED).send({
                message: err.message,
            });
        } else {
            const courses = await Course.findAll({
                attributes: ["name", "syllabus", "instructorId"],
            });
            if (courses) {
                {
                    return res.status(httpStatus.OK).send(courses);
                }
            } else {
                {
                    return res.status(httpStatus.NO_CONTENT).send({
                        message: "No Courses Found",
                    });
                }
            }
        }
    });
};

// any authorized user
const getQuestions = async (req, res) => {
    jwt.verify(req.token, config.SECRET_KEY, async (err, authData) => {
        if (err) {
            return res.status(httpStatus.UNAUTHORIZED).send({
                message: err.message,
            });
        } else {
            let questions = await Question.findAll({
                where: {
                    courseId: req.params.id,
                },
                attributes: ["_id", "username", "body", "date"],
            });

            if (questions) {
                for (let question of questions) {
                    const answers = await Answer.findAll({
                        where: {
                            questionId: question.dataValues._id,
                        },
                        attributes: ["username", "body", "date"],
                    });

                    question.dataValues.answers = answers;
                    delete question.dataValues._id;
                }

                return res.status(httpStatus.OK).send(questions);
            } else {
                {
                    return res.status(httpStatus.NO_CONTENT).send({
                        message: "No Questions Found",
                    });
                }
            }
        }
    });
};

// any authorized user
const getAnswers = async (req, res) => {
    jwt.verify(req.token, config.SECRET_KEY, async (err, authData) => {
        if (err) {
            return res.status(httpStatus.UNAUTHORIZED).send({
                message: err.message,
            });
        } else {
            const answers = await Answer.findAll({
                where: {
                    questionId: req.params.id,
                },
                attributes: ["username", "body", "date"],
            });
            if (answers) {
                {
                    return res.status(httpStatus.OK).send(answers);
                }
            } else {
                {
                    return res.status(httpStatus.NO_CONTENT).send({
                        message: "No Answers Found",
                    });
                }
            }
        }
    });
};

const enrollLearner = async (req, res) => {
    jwt.verify(req.token, config.SECRET_KEY, async (err, authData) => {
        if (err) {
            return res.status(httpStatus.UNAUTHORIZED).send({
                message: err.message,
            });
        }

        const user = await User.findOne({
            where: {
                _id: authData._id,
            },
        });

        if (user == null) {
            return res.status(httpStatus.NOT_FOUND).send({
                message: "user Not Found",
            });
        }

        if (
            user.type != constants.userType.INSTRUCTOR &&
            user.type != constants.userType.ADMIN
        ) {
            return res.status(httpStatus.UNAUTHORIZED).send({
                message:
                    "you must be an admin or learner to make this operation",
            });
        }

        try {
            const learner = await User.findOne({
                where: { email: req.body.email },
                attributes: ["_id"],
            });

            if (!learner) {
                return res.status(httpStatus.NOT_FOUND).send({
                    message: "User Not Found",
                });
            }

            const userCourse = await UserCourse.create({
                userId: learner._id,
                courseId: req.params.id,
            });

            if (!userCourse)
                return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
                    message: "failed to enroll, please try again",
                });

            return res.status(httpStatus.OK).send(userCourse);
        } catch (error) {
            return res.status(httpStatus.ALREADY_REPORTED).send({
                message: "Already enrolled",
            });
        }
    });
};

// 3. Delete Course
const deleteCourse = async (req, res) => {
    jwt.verify(req.token, config.SECRET_KEY, async (err, authData) => {
        if (err) {
            return res.status(httpStatus.UNAUTHORIZED).send({
                message: err.message,
            });
        } else {
            const user = await User.findOne({
                where: {
                    username: authData.username,
                },
            });
            const course = await Course.findOne({
                where: {
                    _id: req.params.id,
                },
            });

            if (user && course) {
                if (
                    user.type == constants.userType.ADMIN ||
                    user._id == course.instructorId
                ) {
                    // Do Your function
                    try {
                        await Course.destroy({
                            where: {
                                _id: req.params.id,
                            },
                        });
                        return res.status(httpStatus.OK).send({
                            message: "Course Deleted Successfully",
                        });
                    } catch (error) {
                        return res.status(httpStatus.FORBIDDEN).send({
                            message: "error during deletion",
                        });
                    }
                } else {
                    return res.status(httpStatus.UNAUTHORIZED).send({
                        message:
                            "you must be an admin  or instructor this course to do this operation ",
                    });
                }
            } else {
                return res.status(httpStatus.NOT_FOUND).send({
                    message: "course Not Found",
                });
            }
        }
    });
};

module.exports = {
    addCourse,
    getCourse,
    getCourses,
    addQuestion,
    getQuestions,
    addAnswer,
    getAnswers,
    enrollLearner,
    deleteCourse,
};
