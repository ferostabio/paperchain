import { connect } from 'react-redux'
import AddForm from './AddForm'
import { addPaper } from './AddFormActions'

const mapStateToProps = (state, ownProps) => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {
    onProfileFormSubmit: (file, refereed, description, quotes) => {
      event.preventDefault()

      dispatch(addPaper(file, refereed, description, quotes))
    }
  }
}

const AddFormContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(AddForm)

export default AddFormContainer
