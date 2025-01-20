import "./CourseParticipation.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import Add from "./../../assets/Add.png";
import Delete from "./../../assets/Line 20.png";
import ReturnButton from "../Components/return";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import Button from "react-bootstrap/esm/Button";

const CourseParticipation: React.FC = () => {
  type Project = {
    id: number; 
    projectName: string; 
    projectGroupName: string;
  };
  
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate("/course-participation");
  };

  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");


  const [user, setUser] = useState<{
    name: string;
    email: string;
  } | null>(null);

  const [projectGroups, setProjectGroups] = useState<string[]>([]);
  const [userProjects, setUserProjects] = useState<string[]>([]);

  const [enrolledProjects, setEnrolledProjects] = useState<Project[]>([]);
  const [selectedEnrolledProjectGroup, setSelectedEnrolledProjectGroup] = useState<string>("");

  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [selectedAvailableProjectGroup, setSelectedAvailableProjectGroup] = useState<string>("");

  useEffect(() => {
    const fetchUserData = async () => {
      const userName = localStorage.getItem("username");
      const userEmail = localStorage.getItem("email");
      if (userName && userEmail) {
        setUser({
          name: userName,
          email: userEmail,
        });
      } else {
        console.warn("User data not found in localStorage");
      }
    };

    fetchUserData();

    const fetchProjectGroups = async () => {
      try {
        const response = await fetch("http://localhost:3000/project-groups");
        const data = await response.json();
        setProjectGroups(data.map((item: Project) => item.projectGroupName));
        console.log("Fetched project groups:", data);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error.message);
        }
      }
    };

    fetchProjectGroups();

    const fetchUserProjects = async() => {
      try {
        const userEmail = localStorage.getItem("email")
        const response = await fetch(`http://localhost:3000/userProjects?userEmail=${userEmail}`);
        const data = await response.json();
        setUserProjects(data.map((item: Project) => item.projectName));
        console.log("Fetched user projects:", data);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(error.message);
        }
      }
    };

    fetchUserProjects();
  }, []);

  useEffect(() => {
    const fetchEnrolledProjects = async () => {
      if (selectedEnrolledProjectGroup) {
        try {
          const response = await fetch(
            `http://localhost:3000/projects?projectGroupName=${selectedEnrolledProjectGroup}`
          );
          const data = await response.json();
          const mappedProjects = data.map((item: Project) => ({
            id: item.id,
            projectName: item.projectName,
            projectGroupName: item.projectGroupName || selectedEnrolledProjectGroup,
          }));

          const enrolledProjects = mappedProjects.filter((item: Project) => userProjects.includes(item.projectName));

          setEnrolledProjects(enrolledProjects);
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error(error.message);
          }
        }
      } else {
        setEnrolledProjects([]);
      }
    };

    fetchEnrolledProjects();
  }, [selectedEnrolledProjectGroup]);

  const filteredEnrolledProjects = enrolledProjects.filter(
    (project) => project.projectGroupName === selectedEnrolledProjectGroup
  );

  useEffect(() => {
    const fetchAvailableProjects = async () => {
      if (selectedAvailableProjectGroup) {
        try {
          const response = await fetch(
            `http://localhost:3000/projects?projectGroupName=${selectedAvailableProjectGroup}`
          );
          const data = await response.json();
          const mappedProjects = data.map((item: Project) => ({
            id: item.id,
            projectName: item.projectName,
            projectGroupName: item.projectGroupName || selectedAvailableProjectGroup,
          }));

          const availableProjectsWithoutEnrolled = mappedProjects.filter((item: Project) => !userProjects.includes(item.projectName));

          setAvailableProjects(availableProjectsWithoutEnrolled);
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error(error.message);
          }
        }
      } else {
        setAvailableProjects([]);
      }
    };

    fetchAvailableProjects();
  }, [selectedAvailableProjectGroup]);

  const filteredAvailableProjects = availableProjects.filter(
    (project: Project) => project.projectGroupName === selectedAvailableProjectGroup
  );

  const handleJoin = async (projectName: string) => {
    if (!user) {
      setMessage("User data not available. Please log in again.");
      return;
    }

    const body = {
      projectName,
      memberName: user.name,
      memberRole: role,
      memberEmail: user.email,
    };

    try {
      const response = await fetch(
        "http://localhost:3000/settings/joinProject",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setMessage(data.message || "Successfully joined the project!");
      if (data.message.includes("successfully")) {
        window.location.reload();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
        setMessage(error.message);
      }
    }
  };

  const handleLeave = async (projectName: string) => {
    if (!user) {
      setMessage("User data not available. Please log in again.");
      return;
    }

    const body = {
      projectName,
      memberEmail: user.email,
    };

    try {
      const response = await fetch(
        "http://localhost:3000/settings/leaveProject",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setMessage(data.message || "Successfully left the project!");
      if (data.message.includes("successfully")) {
        window.location.reload();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
        setMessage(error.message);
      }
    }
  };

  return (
    <div onClick={handleNavigation}>
      <ReturnButton />
      <div className="DashboardContainer">
        <h1>Course Participation</h1>
      </div>
      <div className="BigContainer">
        <div className="ProjectContainer">
          <div className="ProjectTitle">
            <h3>Project Lists - Enrolled Courses</h3>
          </div>
          <div className="SelectWrapper">
            <Select
              onValueChange={(value) => {
                setSelectedEnrolledProjectGroup(value);
              }}
            >
              <SelectTrigger className="SelectTrigger">
                <SelectValue placeholder="Select a project group" />
              </SelectTrigger>
              <SelectContent className="SelectContent">
                {projectGroups.map((group, index) => (
                  <SelectItem key={index} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            {filteredEnrolledProjects.map((project: Project) => (
              <div className="ProjectItem3" key={project.id}>
                <div className="ProjectName">{project.projectName}</div>
                <div className="Imgs">
                  <Dialog>
                    <DialogTrigger className="DialogTrigger">
                      <img className="Delete" src={Delete} alt="Delete" />
                    </DialogTrigger>
                    <DialogContent className="DialogContent">
                      <DialogHeader>
                        <DialogTitle className="DialogTitle">
                          Leave Project
                        </DialogTitle>
                      </DialogHeader>
                      <div className="LeaveText">
                        Are you sure you want to leave {project.projectName} ?{" "}
                      </div>
                      <DialogFooter>
                        <Button
                          className="create"
                          variant="primary"
                          onClick={() => handleLeave(project.projectName)}
                        >
                          Confirm
                        </Button>
                      </DialogFooter>
                      {message && <div className="Message">{message}</div>}
                    </DialogContent>
                  </Dialog>
                </div>
                <hr className="ProjectDivider" />
              </div>
            ))}
          </div>
        </div>

        <div className="ProjectContainer">
          <div className="ProjectTitle">
            <h3>Project Lists - Available Courses</h3>
          </div>
          <div className="SelectWrapper">
            <Select
              onValueChange={(value) => {
                setSelectedAvailableProjectGroup(value);
              }}
            >
              <SelectTrigger className="SelectTrigger">
                <SelectValue placeholder="Select a project group" />
              </SelectTrigger>
              <SelectContent className="SelectContent">
                {projectGroups.map((group, index) => (
                  <SelectItem key={index} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            {filteredAvailableProjects.map((project: Project) => (
              <div className="ProjectItem3" key={project.id}>
                <div className="ProjectName">{project.projectName}</div>
                <div className="Imgs">
                  <Dialog>
                    <DialogTrigger className="DialogTrigger">
                      <img className="Add" src={Add} alt="Add" />
                    </DialogTrigger>
                    <DialogContent className="DialogContent">
                      <DialogHeader>
                        <DialogTitle className="DialogTitle">
                          Join Project
                        </DialogTitle>
                      </DialogHeader>
                      <div className="RoleInput">
                        <div className="Role">Role: </div>
                        <input
                          type="text"
                          className="ProjAdmin-inputBox"
                          placeholder="Enter your role"
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          className="create"
                          variant="primary"
                          onClick={() => handleJoin(project.projectName)}
                        >
                          Join
                        </Button>
                      </DialogFooter>
                      {message && <div className="Message">{message}</div>}
                    </DialogContent>
                  </Dialog>
                </div>
                <hr className="ProjectDivider" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CourseParticipation;
