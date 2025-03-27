from expert_matcher.model.consultant import Consultant, ConsultantExperience
from expert_matcher.config.logger import logger


def consultant_factory(
    consultant_details: list[tuple[int, str, str, str, str, str, str, str, str, str]],
) -> list[Consultant]:
    consultant_id_index = 0
    given_name_index = 1
    surname_index = 2
    linkedin_profile_url_index = 3
    email_index = 4
    cv_index = 5
    photo_url_200_index = 7
    photo_url_400_index = 8
    cv_summary_index = 9
    consultants: list[Consultant] = []
    for consultant_detail in consultant_details:
        consultant = Consultant(
            id=consultant_detail[consultant_id_index],
            given_name=consultant_detail[given_name_index],
            surname=consultant_detail[surname_index],
            linkedin_profile_url=consultant_detail[linkedin_profile_url_index],
            email=consultant_detail[email_index],
            cv=consultant_detail[cv_index],
            photo_url_200=consultant_detail[photo_url_200_index],
            photo_url_400=consultant_detail[photo_url_400_index],
            cv_summary=consultant_detail[cv_summary_index],
        )
        consultants.append(consultant)
    return consultants


def consultant_experience_factory(
    consultant_experience: list[tuple[int, int, str, str, str, str, str]],
) -> list[ConsultantExperience]:
    (
        index_id,
        index_consultant_id,
        index_title,
        index_location,
        index_company_name,
        index_start_date,
        index_end_date,
    ) = (0, 1, 2, 3, 4, 5, 6)
    consultant_experiences: list[ConsultantExperience] = []
    for r in consultant_experience:
        try:
            consultant_experiences.append(
                ConsultantExperience(
                    id=r[index_id],
                    consultant_id=r[index_consultant_id],
                    title=r[index_title],
                    location=r[index_location],
                    company_name=r[index_company_name],
                    start_date=r[index_start_date],
                    end_date=r[index_end_date],
                )
            )
        except Exception as e:
            logger.error(f"Error creating consultant experience: {e}")
    return consultant_experiences
